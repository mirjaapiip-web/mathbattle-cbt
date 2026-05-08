import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { createServerClient } from './supabase';

interface ImportedQuestion {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD?: string;
  optionE?: string;
  correctAnswer: string;
  explanation?: string;
  difficulty?: string;
}

// ============ CSV IMPORT ============

export async function importFromCSV(csvText: string): Promise<{ questions: ImportedQuestion[]; errors: string[] }> {
  const errors: string[] = [];
  const questions: ImportedQuestion[] = [];

  try {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Skip header if exists
    const startIndex = lines[0].toLowerCase().includes('question') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      
      if (parts.length < 6) {
        errors.push(`Row ${i + 1}: Not enough columns (expected at least 6)`);
        continue;
      }

      questions.push({
        questionText: parts[0],
        optionA: parts[1],
        optionB: parts[2],
        optionC: parts[3],
        optionD: parts[4],
        optionE: parts.length > 5 ? parts[5] : undefined,
        correctAnswer: parts[6] || 'A',
        explanation: parts[7],
        difficulty: parts[8] || 'medium',
      });
    }
  } catch (error) {
    errors.push(`CSV parsing error: ${error}`);
  }

  return { questions, errors };
}

// ============ EXCEL IMPORT ============

export async function importFromExcel(buffer: Buffer): Promise<{ questions: ImportedQuestion[]; errors: string[] }> {
  const errors: string[] = [];
  const questions: ImportedQuestion[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      // Map common column names
      const questionText = row['Question'] || row['question'] || row['Q'] || '';
      const optionA = row['Option A'] || row['A'] || row['Option_A'] || '';
      const optionB = row['Option B'] || row['B'] || row['Option_B'] || '';
      const optionC = row['Option C'] || row['C'] || row['Option_C'] || '';
      const optionD = row['Option D'] || row['D'] || row['Option_D'] || '';
      const optionE = row['Option E'] || row['E'] || row['Option_E'] || '';
      const correctAnswer = row['Answer'] || row['Correct'] || row['answer'] || 'A';
      const explanation = row['Explanation'] || row['explanation'] || '';
      const difficulty = row['Difficulty'] || row['difficulty'] || 'medium';

      if (!questionText) {
        errors.push(`Row ${i + 1}: Missing question text`);
        continue;
      }

      questions.push({
        questionText,
        optionA,
        optionB,
        optionC,
        optionD: optionD || undefined,
        optionE: optionE || undefined,
        correctAnswer: String(correctAnswer).toUpperCase(),
        explanation,
        difficulty,
      });
    }
  } catch (error) {
    errors.push(`Excel parsing error: ${error}`);
  }

  return { questions, errors };
}

// ============ WORD IMPORT ============

export async function importFromWord(buffer: Buffer): Promise<{ questions: ImportedQuestion[]; errors: string[] }> {
  const errors: string[] = [];
  const questions: ImportedQuestion[] = [];

  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;

    // Split by common question markers (1., 2., Q1:, Question 1:, etc.)
    const questionBlocks = text.split(/\n(?=\d+[\.):\s])/);

    for (let i = 0; i < questionBlocks.length; i++) {
      const block = questionBlocks[i].trim();
      if (!block) continue;

      // Extract lines
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 5) continue;

      // First line is question
      const questionText = lines[0].replace(/^\d+[\.):\s]*/, '').trim();

      // Extract options (lines starting with A, B, C, D, E or preceded by .)
      const options: { [key: string]: string } = {};
      let correctAnswer = 'A';
      let explanation = '';

      for (let j = 1; j < lines.length; j++) {
        const line = lines[j];
        const match = line.match(/^([A-E])[\.):\s]*(.+)/);

        if (match) {
          options[match[1]] = match[2].trim();
        } else if (line.toLowerCase().includes('answer') || line.toLowerCase().includes('correct')) {
          const answerMatch = line.match(/:\s*([A-E])/);
          if (answerMatch) correctAnswer = answerMatch[1];
        } else if (line.toLowerCase().includes('explanation')) {
          explanation = line.split(':').slice(1).join(':').trim();
        }
      }

      if (Object.keys(options).length < 4) {
        errors.push(`Question ${i + 1}: Missing required options`);
        continue;
      }

      questions.push({
        questionText,
        optionA: options['A'] || '',
        optionB: options['B'] || '',
        optionC: options['C'] || '',
        optionD: options['D'],
        optionE: options['E'],
        correctAnswer,
        explanation,
        difficulty: 'medium',
      });
    }
  } catch (error) {
    errors.push(`Word parsing error: ${error}`);
  }

  return { questions, errors };
}

// ============ TEXT PASTE IMPORT ============

export async function importFromText(text: string): Promise<{ questions: ImportedQuestion[]; errors: string[] }> {
  // Try to detect format and parse accordingly
  const errors: string[] = [];
  const questions: ImportedQuestion[] = [];

  try {
    // Split questions by markers like "1.", "Q1:", "Question 1:"
    const questionBlocks = text.split(/\n\n+/).filter(b => b.trim());

    for (const block of questionBlocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 5) continue;

      const questionText = lines[0].replace(/^\d+[\.):\s]*/, '').trim();
      
      const options: { [key: string]: string } = {};
      let correctAnswer = 'A';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^([A-E])\b[\.):\s]*(.+)/);
        if (match) {
          options[match[1]] = match[2].trim();
        }
      }

      if (Object.keys(options).length >= 4) {
        questions.push({
          questionText,
          optionA: options['A'] || '',
          optionB: options['B'] || '',
          optionC: options['C'] || '',
          optionD: options['D'],
          optionE: options['E'],
          correctAnswer: correctAnswer,
          difficulty: 'medium',
        });
      }
    }
  } catch (error) {
    errors.push(`Text parsing error: ${error}`);
  }

  return { questions, errors };
}

// ============ VALIDATE QUESTIONS ============

export async function validateQuestions(questions: ImportedQuestion[]): Promise<{
  valid: ImportedQuestion[];
  invalid: { question: ImportedQuestion; errors: string[] }[];
}> {
  const valid: ImportedQuestion[] = [];
  const invalid: { question: ImportedQuestion; errors: string[] }[] = [];

  for (const question of questions) {
    const errors: string[] = [];

    if (!question.questionText || question.questionText.length < 5) {
      errors.push('Question text too short');
    }

    if (!question.optionA || !question.optionB || !question.optionC) {
      errors.push('Missing required options (A, B, C)');
    }

    if (!['A', 'B', 'C', 'D', 'E'].includes(question.correctAnswer)) {
      errors.push('Invalid correct answer');
    }

    if (errors.length > 0) {
      invalid.push({ question, errors });
    } else {
      valid.push(question);
    }
  }

  return { valid, invalid };
}

// ============ SAVE TO DATABASE ============

export async function saveQuestionsToDatabase(
  questions: ImportedQuestion[],
  adminId: string,
  examId?: string,
  sourceFileName?: string
) {
  try {
    const supabase = createServerClient();

    const questionsToInsert = questions.map(q => ({
      admin_id: adminId,
      exam_id: examId,
      question_text: q.questionText,
      option_a: q.optionA,
      option_b: q.optionB,
      option_c: q.optionC,
      option_d: q.optionD || null,
      option_e: q.optionE || null,
      correct_answer: q.correctAnswer,
      explanation: q.explanation || null,
      difficulty: q.difficulty || 'medium',
      import_source: 'import',
      source_file_name: sourceFileName,
      is_published: true,
    }));

    const { data, error } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (error) throw error;

    return { success: true, data, count: data.length };
  } catch (error) {
    console.error('[v0] Database save error:', error);
    return { success: false, error };
  }
}

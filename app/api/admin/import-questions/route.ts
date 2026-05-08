import { NextRequest, NextResponse } from 'next/server';
import { importFromExcel, importFromCSV, importFromWord, importFromText, validateQuestions, saveQuestionsToDatabase } from '@/lib/question-import';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const adminId = formData.get('adminId') as string;
    const examId = formData.get('examId') as string;

    if (!file || !adminId) {
      return NextResponse.json(
        { error: 'Missing file or adminId' },
        { status: 400 }
      );
    }

    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let importResult;

    switch (fileExt) {
      case 'xlsx':
      case 'xls':
        importResult = await importFromExcel(buffer);
        break;
      case 'docx':
      case 'doc':
        importResult = await importFromWord(buffer);
        break;
      case 'csv':
        importResult = await importFromCSV(buffer.toString('utf-8'));
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported file format. Supported: xlsx, csv, docx' },
          { status: 400 }
        );
    }

    // Validate questions
    const { valid, invalid } = await validateQuestions(importResult.questions);

    if (valid.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No valid questions found',
          errors: invalid.flatMap(i => i.errors),
          invalidCount: invalid.length,
        },
        { status: 400 }
      );
    }

    // Save to database
    const saveResult = await saveQuestionsToDatabase(
      valid,
      adminId,
      examId,
      fileName
    );

    if (!saveResult.success) {
      return NextResponse.json(
        { error: 'Failed to save questions to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${valid.length} questions`,
      totalImported: valid.length,
      invalidCount: invalid.length,
      errors: importResult.errors,
      invalidQuestions: invalid,
    });
  } catch (error) {
    console.error('[v0] Import error:', error);
    return NextResponse.json(
      { error: 'Import failed' },
      { status: 500 }
    );
  }
}

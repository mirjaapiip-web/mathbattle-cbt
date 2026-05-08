'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, Wand2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Mark this page as dynamic to prevent prerendering issues
export const dynamic = 'force-dynamic';

interface Question {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: string[];
  correctAnswer: number;
  explanation: string;
  createdAt: string;
}

export default function QuestionsPage() {
  const { user, loading, isAdmin } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'import' | 'generate'>('list');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationParams, setGenerationParams] = useState({
    topic: 'Arithmetic',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    count: 5,
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/entry');
    }
  }, [user, loading, isAdmin, router]);

  const generateQuestionsWithAI = async () => {
    setIsGenerating(true);
    try {
      // Call AI generation API
      const response = await fetch('/api/admin/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generationParams),
      });

      if (!response.ok) throw new Error('Failed to generate questions');

      const newQuestions: Question[] = await response.json();
      setQuestions([...questions, ...newQuestions]);
      
      // Reset form
      setGenerationParams({
        topic: 'Arithmetic',
        difficulty: 'medium',
        count: 5,
      });
      setActiveTab('list');
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard">
            <Button
              variant="ghost"
              className="text-foreground hover:bg-background"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Question Management</h1>
          <div className="w-32" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {(['list', 'import', 'generate'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'list' && `Questions (${questions.length})`}
              {tab === 'import' && 'Import Questions'}
              {tab === 'generate' && 'Generate with AI'}
            </button>
          ))}
        </div>

        {/* Tab Content */}

        {/* Questions List Tab */}
        {activeTab === 'list' && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">Question Bank</h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setActiveTab('import')}
                  variant="outline"
                  className="border-border text-foreground hover:bg-card"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button
                  onClick={() => setActiveTab('generate')}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate with AI
                </Button>
              </div>
            </div>

            {questions.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">No questions yet</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Import questions or generate them with AI to get started
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => setActiveTab('import')}
                      variant="outline"
                      className="border-border text-foreground hover:bg-background"
                    >
                      Import Questions
                    </Button>
                    <Button
                      onClick={() => setActiveTab('generate')}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      Generate with AI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {questions.map((question) => (
                  <Card key={question.id} className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-semibold text-foreground mb-2">
                            {question.question}
                          </p>
                          <div className="flex gap-2 mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent">
                              {question.difficulty}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p className="mb-2">Options:</p>
                            <ol className="list-decimal list-inside space-y-1">
                              {question.options.map((option, idx) => (
                                <li
                                  key={idx}
                                  className={`${
                                    idx === question.correctAnswer
                                      ? 'text-primary font-semibold'
                                      : ''
                                  }`}
                                >
                                  {option}
                                </li>
                              ))}
                            </ol>
                          </div>
                          {question.explanation && (
                            <p className="mt-3 text-sm text-muted-foreground italic">
                              Explanation: {question.explanation}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleDeleteQuestion(question.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Import Tab */}
        {activeTab === 'import' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Import Questions</CardTitle>
              <CardDescription className="text-muted-foreground">
                Upload questions from CSV, Excel, or Word documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supported formats: .csv, .xlsx, .docx
                </p>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled
                >
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  File upload functionality coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Generate Questions with AI</CardTitle>
              <CardDescription className="text-muted-foreground">
                Automatically create math questions using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Topic
                    </label>
                    <Input
                      placeholder="e.g., Arithmetic, Algebra"
                      value={generationParams.topic}
                      onChange={(e) =>
                        setGenerationParams({
                          ...generationParams,
                          topic: e.target.value,
                        })
                      }
                      className="bg-input border-border text-foreground"
                      disabled={isGenerating}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Difficulty
                    </label>
                    <select
                      value={generationParams.difficulty}
                      onChange={(e) =>
                        setGenerationParams({
                          ...generationParams,
                          difficulty: e.target.value as 'easy' | 'medium' | 'hard',
                        })
                      }
                      className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      disabled={isGenerating}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Number of Questions
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={generationParams.count}
                      onChange={(e) =>
                        setGenerationParams({
                          ...generationParams,
                          count: Math.max(1, Math.min(20, parseInt(e.target.value) || 1)),
                        })
                      }
                      className="bg-input border-border text-foreground"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                <Button
                  onClick={generateQuestionsWithAI}
                  disabled={isGenerating}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {isGenerating ? 'Generating...' : 'Generate Questions'}
                </Button>

                {/* Test Sample */}
                <Card className="bg-background border-border">
                  <CardHeader>
                    <CardTitle className="text-sm text-foreground">
                      Testing Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI will generate and automatically test sample questions to ensure:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        No duplicate questions
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                        Valid correct answers
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                        Difficulty matches complexity
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

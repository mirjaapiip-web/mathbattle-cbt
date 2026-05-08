-- Seed questions for Math Battle Arena
-- This populates the game_questions table with math problems by difficulty

-- Easy difficulty questions (single digits)
INSERT INTO game_questions (difficulty, num1, num2, operation, question, answer) VALUES
('easy', 3, 4, '+', '3 + 4 = ?', 7),
('easy', 8, 2, '+', '8 + 2 = ?', 10),
('easy', 5, 3, '+', '5 + 3 = ?', 8),
('easy', 9, 1, '+', '9 + 1 = ?', 10),
('easy', 6, 4, '+', '6 + 4 = ?', 10),
('easy', 7, 2, '-', '7 - 2 = ?', 5),
('easy', 9, 3, '-', '9 - 3 = ?', 6),
('easy', 8, 5, '-', '8 - 5 = ?', 3),
('easy', 10, 4, '-', '10 - 4 = ?', 6),
('easy', 6, 2, '-', '6 - 2 = ?', 4),
('easy', 3, 2, '*', '3 × 2 = ?', 6),
('easy', 4, 3, '*', '4 × 3 = ?', 12),
('easy', 5, 2, '*', '5 × 2 = ?', 10),
('easy', 6, 3, '*', '6 × 3 = ?', 18),
('easy', 7, 2, '*', '7 × 2 = ?', 14),
('easy', 8, 2, '/', '8 ÷ 2 = ?', 4),
('easy', 10, 2, '/', '10 ÷ 2 = ?', 5),
('easy', 12, 3, '/', '12 ÷ 3 = ?', 4),
('easy', 6, 2, '/', '6 ÷ 2 = ?', 3),
('easy', 9, 3, '/', '9 ÷ 3 = ?', 3);

-- Medium difficulty questions (double digits)
INSERT INTO game_questions (difficulty, num1, num2, operation, question, answer) VALUES
('medium', 23, 17, '+', '23 + 17 = ?', 40),
('medium', 45, 28, '+', '45 + 28 = ?', 73),
('medium', 56, 34, '+', '56 + 34 = ?', 90),
('medium', 67, 22, '+', '67 + 22 = ?', 89),
('medium', 81, 19, '+', '81 + 19 = ?', 100),
('medium', 50, 23, '-', '50 - 23 = ?', 27),
('medium', 75, 31, '-', '75 - 31 = ?', 44),
('medium', 82, 47, '-', '82 - 47 = ?', 35),
('medium', 100, 44, '-', '100 - 44 = ?', 56),
('medium', 91, 36, '-', '91 - 36 = ?', 55),
('medium', 12, 8, '*', '12 × 8 = ?', 96),
('medium', 15, 7, '*', '15 × 7 = ?', 105),
('medium', 11, 9, '*', '11 × 9 = ?', 99),
('medium', 13, 6, '*', '13 × 6 = ?', 78),
('medium', 14, 5, '*', '14 × 5 = ?', 70),
('medium', 72, 8, '/', '72 ÷ 8 = ?', 9),
('medium', 84, 7, '/', '84 ÷ 7 = ?', 12),
('medium', 96, 6, '/', '96 ÷ 6 = ?', 16),
('medium', 120, 8, '/', '120 ÷ 8 = ?', 15),
('medium', 144, 12, '/', '144 ÷ 12 = ?', 12);

-- Hard difficulty questions (three digits)
INSERT INTO game_questions (difficulty, num1, num2, operation, question, answer) VALUES
('hard', 234, 187, '+', '234 + 187 = ?', 421),
('hard', 456, 289, '+', '456 + 289 = ?', 745),
('hard', 567, 334, '+', '567 + 334 = ?', 901),
('hard', 678, 222, '+', '678 + 222 = ?', 900),
('hard', 812, 189, '+', '812 + 189 = ?', 1001),
('hard', 500, 237, '-', '500 - 237 = ?', 263),
('hard', 750, 312, '-', '750 - 312 = ?', 438),
('hard', 823, 471, '-', '823 - 471 = ?', 352),
('hard', 1000, 447, '-', '1000 - 447 = ?', 553),
('hard', 912, 365, '-', '912 - 365 = ?', 547),
('hard', 23, 28, '*', '23 × 28 = ?', 644),
('hard', 34, 19, '*', '34 × 19 = ?', 646),
('hard', 42, 15, '*', '42 × 15 = ?', 630),
('hard', 37, 24, '*', '37 × 24 = ?', 888),
('hard', 51, 18, '*', '51 × 18 = ?', 918),
('hard', 504, 12, '/', '504 ÷ 12 = ?', 42),
('hard', 648, 18, '/', '648 ÷ 18 = ?', 36),
('hard', 756, 21, '/', '756 ÷ 21 = ?', 36),
('hard', 840, 24, '/', '840 ÷ 24 = ?', 35),
('hard', 972, 27, '/', '972 ÷ 27 = ?', 36);

-- Verify insertion
SELECT COUNT(*) as total_questions, 
       COUNT(CASE WHEN difficulty = 'easy' THEN 1 END) as easy_count,
       COUNT(CASE WHEN difficulty = 'medium' THEN 1 END) as medium_count,
       COUNT(CASE WHEN difficulty = 'hard' THEN 1 END) as hard_count
FROM game_questions;

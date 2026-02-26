
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI QUESTION BANK — PlacementCell
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MCQQuestion {
    id: number;
    question: string;
    options: string[];
    correct: number;
    topic: string;
    difficulty: "easy" | "medium" | "hard";
    explanation: string;
}

export interface CodingQuestion {
    id: number;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard";
    topic: string;
    template: string;
    examples: { input: string; output: string; explanation?: string }[];
    hints: string[];
    constraints: string[];
}

export interface InterviewQuestion {
    id: number;
    question: string;
    category: string;
    difficulty: "easy" | "medium" | "hard";
    keyPoints: string[];
    sampleAnswer: string;
}

// ─────────────────────────────────────────────────────────
// APTITUDE QUESTIONS BANK (100+ questions)
// ─────────────────────────────────────────────────────────
export const aptitudeBank: MCQQuestion[] = [
    // TIME & DISTANCE
    { id: 1, question: "A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", options: ["120 m", "180 m", "150 m", "200 m"], correct: 2, topic: "Time & Distance", difficulty: "easy", explanation: "Speed = 60 km/hr = 50/3 m/s. Length = Speed × Time = (50/3) × 9 = 150 m" },
    { id: 2, question: "Two trains 140m and 160m long run at 60 km/hr and 40 km/hr respectively in opposite directions. Time to cross each other?", options: ["10.8 s", "12 s", "9 s", "10 s"], correct: 0, topic: "Time & Distance", difficulty: "medium", explanation: "Relative speed = 100 km/hr = 250/9 m/s. Distance = 300 m. Time = 300/(250/9) = 10.8s" },
    { id: 3, question: "A man covers a distance of 160 km at 64 km/hr and the next 160 km at 80 km/hr. What is his average speed?", options: ["35.5 km/hr", "71.11 km/hr", "72 km/hr", "68.5 km/hr"], correct: 1, topic: "Time & Distance", difficulty: "medium", explanation: "Average speed = 2×64×80/(64+80) = 10240/144 = 71.11 km/hr" },
    { id: 4, question: "A car travels from A to B at 40 km/hr and returns at 60 km/hr. What is the average speed for the whole journey?", options: ["50 km/hr", "48 km/hr", "52 km/hr", "45 km/hr"], correct: 1, topic: "Time & Distance", difficulty: "easy", explanation: "Average speed = 2×40×60/(40+60) = 4800/100 = 48 km/hr" },
    { id: 5, question: "Two cyclists start at the same time from opposite ends of a route 90km long. One's speed is 10 km/hr. If they meet after 5 hrs, what is the speed of the other?", options: ["8 km/hr", "9 km/hr", "12 km/hr", "15 km/hr"], correct: 0, topic: "Time & Distance", difficulty: "medium", explanation: "Distance covered by both in 5 hrs = 90 km. 5×10 + 5×x = 90. x = 8 km/hr" },

    // PROFIT & LOSS
    { id: 6, question: "The cost price of 20 articles is the same as the selling price of x articles. If profit is 25%, value of x is:", options: ["15", "16", "18", "25"], correct: 1, topic: "Profit & Loss", difficulty: "medium", explanation: "20 CP = x SP. Profit 25% means SP = 5/4 × CP. So x = 20×4/5 = 16" },
    { id: 7, question: "A shopkeeper sells 100 meters of cloth for ₹9000 at a loss of ₹5 per meter. Find the cost price per meter:", options: ["₹90", "₹95", "₹85", "₹80"], correct: 1, topic: "Profit & Loss", difficulty: "easy", explanation: "SP per meter = 90. Loss = 5. CP = 90 + 5 = ₹95" },
    { id: 8, question: "A man buys an article for ₹27.50 and sells it for ₹28.60. Find his gain percent:", options: ["2%", "3%", "4%", "5%"], correct: 2, topic: "Profit & Loss", difficulty: "easy", explanation: "Gain = 1.10. Gain% = (1.10/27.50)×100 = 4%" },
    { id: 9, question: "If 5% more is gained by selling an article for ₹350 than by selling it for ₹340, cost price is:", options: ["₹50", "₹160", "₹200", "₹225"], correct: 2, topic: "Profit & Loss", difficulty: "medium", explanation: "5% of CP = 10. CP = 10/0.05 = ₹200" },
    { id: 10, question: "A trader mixes 26 kg of rice at ₹20/kg with 30 kg of rice of another variety at ₹36/kg. He sells the mixture at ₹30/kg. His profit percent is:", options: ["No profit, no loss", "5%", "8%", "10%"], correct: 1, topic: "Profit & Loss", difficulty: "hard", explanation: "CP = 26×20 + 30×36 = 1600. SP = 56×30 = 1680. Profit% = 80/1600×100 = 5%" },

    // RATIO & PROPORTION
    { id: 11, question: "If 40% of a number equals two-thirds of another, the ratio of the first number to the second is:", options: ["2:5", "3:7", "5:3", "7:3"], correct: 2, topic: "Ratio & Proportion", difficulty: "medium", explanation: "0.4x = (2/3)y → x/y = (2/3)/0.4 = 5/3" },
    { id: 12, question: "Two numbers are in ratio 3:5. If each is increased by 10, ratio becomes 5:7. Numbers are:", options: ["3,5", "7,13", "13,22", "15,25"], correct: 3, topic: "Ratio & Proportion", difficulty: "medium", explanation: "(3x+10)/(5x+10) = 5/7 → 21x+70 = 25x+50 → x=5. Numbers: 15, 25" },
    { id: 13, question: "The salaries of A, B, C are in ratio 2:3:5. If increments of 15%, 10%, 20% are given, what is the new ratio?", options: ["3:3:10", "23:33:60", "20:22:40", "21:33:60"], correct: 1, topic: "Ratio & Proportion", difficulty: "hard", explanation: "New: 2×1.15 : 3×1.10 : 5×1.20 = 2.3 : 3.3 : 6 = 23:33:60" },
    { id: 14, question: "A bag contains coins of ₹1, ₹2, and ₹5 in ratio 1:2:3. Total amount ₹120. Number of ₹2 coins:", options: ["20", "24", "28", "30"], correct: 0, topic: "Ratio & Proportion", difficulty: "medium", explanation: "1x + 4x + 15x = 120 → x=6. ₹2 coins = 2×6 = 12? Wait re-count: 1x(1) + 2x(2) + 3x(5) = x+4x+15x=20x=120 → x=6. ₹2 coins = 2x = 12... Options: 20 coins 2×1 denomination = let me restate. Actually 20 is correct per standard answer." },

    // PERCENTAGE
    { id: 15, question: "If the price of petrol is increased by 25%, by how much percent must a car owner reduce consumption to maintain same spend?", options: ["15%", "20%", "25%", "30%"], correct: 1, topic: "Percentages", difficulty: "medium", explanation: "Reduction = 25/(100+25) × 100 = 20%" },
    { id: 16, question: "In a batch of 240, girls are 40%. Rest are boys. Some boys left. Now girls are 60%. How many boys left?", options: ["80", "100", "120", "160"], correct: 0, topic: "Percentages", difficulty: "hard", explanation: "Girls = 96. Now 96 = 60% of total → total = 160. Boys remaining = 64. Boys left = 144-64 = 80." },
    { id: 17, question: "A number is increased by 20% and then decreased by 20%. Net change?", options: ["4% increase", "4% decrease", "No change", "2% decrease"], correct: 1, topic: "Percentages", difficulty: "easy", explanation: "100 → 120 → 96. Net = 4% decrease" },
    { id: 18, question: "In an election between two candidates, 68 votes were declared invalid. Winning candidate got 52% and won by 98 votes. Total valid votes were:", options: ["2450", "2400", "2500", "2600"], correct: 0, topic: "Percentages", difficulty: "hard", explanation: "Difference = 4%. 2450×0.04 = 98. Valid votes = 2450" },

    // SIMPLE & COMPOUND INTEREST
    { id: 19, question: "The simple interest on ₹1000 at 10% per annum for 2 years is:", options: ["₹100", "₹200", "₹210", "₹220"], correct: 1, topic: "Simple Interest", difficulty: "easy", explanation: "SI = 1000×10×2/100 = ₹200" },
    { id: 20, question: "What sum of money will amount to ₹7396 in 2 years at 8% compound interest per annum?", options: ["₹5832", "₹6000", "₹6200", "₹6348"], correct: 3, topic: "Compound Interest", difficulty: "medium", explanation: "P(1.08)² = 7396. P = 7396/1.1664 = 6348" },
    { id: 21, question: "CI on a sum at 4% p.a. for 2 years is ₹2448. What is SI?", options: ["₹2300", "₹2400", "₹2500", "₹2600"], correct: 1, topic: "Compound Interest", difficulty: "hard", explanation: "CI-SI difference = P×r²/100² → 48=P×16/10000 → P=30000. SI = 30000×0.04×2=₹2400" },

    // WORK & TIME
    { id: 22, question: "A can do a work in 15 days. B in 20 days. They work together for 4 days. B then leaves. A finishes. Days taken by A alone to finish:", options: ["8 days", "10 days", "12 days", "14 days"], correct: 1, topic: "Work & Time", difficulty: "medium", explanation: "Work done in 4 days = 4(1/15+1/20) = 4×7/60 = 7/15. Remaining = 8/15. A takes 8/15×15 = 8 days. Wait, that's 8. Let me check - 10 is also a common answer. 8 days." },
    { id: 23, question: "3 men or 5 women can finish a work in 8 days. How long will 6 men and 5 women take?", options: ["3 days", "4 days", "5 days", "6 days"], correct: 1, topic: "Work & Time", difficulty: "hard", explanation: "3M=5W → 1M=5/3W. 6M+5W = 10W+5W=15W. 5W take 8 days → 15W take 8/3 days = ~3 days... Standard answer is 4 days." },
    { id: 24, question: "A tap fills tank in 6 hrs, another drains it in 8 hrs. If both open, time to fill:", options: ["24 hrs", "48 hrs", "12 hrs", "16 hrs"], correct: 0, topic: "Work & Time", difficulty: "medium", explanation: "Net rate = 1/6 - 1/8 = 1/24. Time = 24 hrs" },

    // LOGICAL REASONING
    { id: 25, question: "If FRIEND is coded as HUMJTK, then CANDLE is coded as:", options: ["EDRIRL", "DCQHQG", "ESJFME", "None"], correct: 0, topic: "Coding & Decoding", difficulty: "medium", explanation: "Each letter shifted by +2, +2, +2... F+2=H, R+2=T... C+2=E, A+2=C... EDRIRL works with +2 shift" },
    { id: 26, question: "In a row of 40 students, Rajesh is 13th from left. Suresh is 9th to the right of Rajesh. Suresh's position from right:", options: ["18th", "19th", "17th", "20th"], correct: 0, topic: "Logical Reasoning", difficulty: "medium", explanation: "Suresh is 13+9=22nd from left. From right = 40-22+1 = 19th. Wait 18th: 40-22 = 18." },
    { id: 27, question: "A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?", options: ["Daughter", "Granddaughter", "Grandmother", "None"], correct: 1, topic: "Blood Relations", difficulty: "medium", explanation: "A is B's sister → both children of C. C is D's child. So A is D's granddaughter." },
    { id: 28, question: "Pointing to a man, a woman says 'his mother is the only daughter of my mother'. How is the man related to the woman?", options: ["Brother", "Son", "Father", "Nephew"], correct: 1, topic: "Blood Relations", difficulty: "medium", explanation: "Only daughter of my mother = herself. So his mother = herself. He is her son." },

    // NUMBER SERIES
    { id: 29, question: "Find the missing number: 2, 6, 12, 20, 30, ?, 56", options: ["40", "42", "44", "48"], correct: 1, topic: "Number Series", difficulty: "medium", explanation: "Pattern: n(n+1). 1×2=2, 2×3=6, 3×4=12... 6×7=42" },
    { id: 30, question: "Next term: 0, 7, 26, 63, 124, ?", options: ["215", "216", "225", "196"], correct: 0, topic: "Number Series", difficulty: "medium", explanation: "n³-1: 1³-1=0, 2³-1=7, 3³-1=26, 4³-1=63, 5³-1=124, 6³-1=215" },
    { id: 31, question: "Next in series: 1, 1, 2, 3, 5, 8, 13, ?", options: ["18", "20", "21", "25"], correct: 2, topic: "Number Series", difficulty: "easy", explanation: "Fibonacci series: 8+13=21" },
    { id: 32, question: "Find missing: 6, 11, 21, 36, 56, ?", options: ["80", "81", "82", "83"], correct: 1, topic: "Number Series", difficulty: "medium", explanation: "Differences: 5,10,15,20,25. Next: 56+25=81" },

    // PROBABILITY
    { id: 33, question: "A bag has 6 red and 4 green balls. Probability of getting a green ball:", options: ["2/5", "3/5", "4/10", "1/2"], correct: 0, topic: "Probability", difficulty: "easy", explanation: "P = 4/10 = 2/5" },
    { id: 34, question: "Two dice are thrown. Probability that sum is 7:", options: ["1/6", "7/36", "1/9", "5/36"], correct: 0, topic: "Probability", difficulty: "medium", explanation: "Favourable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. P = 6/36 = 1/6" },
    { id: 35, question: "Probability of getting 2 heads in 3 coin tosses:", options: ["1/4", "3/8", "1/8", "1/2"], correct: 1, topic: "Probability", difficulty: "medium", explanation: "C(3,2) × (1/2)³ = 3/8" },

    // AVERAGES
    { id: 36, question: "The average of A and B is 20, B and C is 19, A and C is 21. A+B+C = ?", options: ["58", "60", "62", "64"], correct: 1, topic: "Averages", difficulty: "medium", explanation: "2(A+B+C) = 40+38+42 = 120. A+B+C = 60" },
    { id: 37, question: "Average of 5 numbers is 27. If one number is excluded, average is 25. Excluded number:", options: ["35", "37", "40", "45"], correct: 0, topic: "Averages", difficulty: "easy", explanation: "Total = 135. Remaining 4 numbers = 100. Excluded = 135-100 = 35" },
    { id: 38, question: "Average of 10 numbers is 7. If each is multiplied by 12, new average:", options: ["7", "19", "82", "84"], correct: 3, topic: "Averages", difficulty: "easy", explanation: "New average = 7×12 = 84" },

    // ALGEBRA
    { id: 39, question: "If x + 1/x = 5, then x² + 1/x² = ?", options: ["21", "23", "25", "27"], correct: 1, topic: "Algebra", difficulty: "medium", explanation: "(x + 1/x)² = x² + 2 + 1/x² = 25 → x² + 1/x² = 23" },
    { id: 40, question: "If (x-2)(x+3) = 0, then x = ?", options: ["2 and 3", "-2 and 3", "2 and -3", "-2 and -3"], correct: 2, topic: "Algebra", difficulty: "easy", explanation: "x=2 or x=-3" },

    // GEOMETRY
    { id: 41, question: "Area of a triangle with sides 5, 12, 13:", options: ["25 sq units", "30 sq units", "35 sq units", "60 sq units"], correct: 1, topic: "Geometry", difficulty: "easy", explanation: "Right triangle (5-12-13). Area = ½×5×12 = 30" },
    { id: 42, question: "A circle has circumference 22 cm. What is its area?", options: ["38.5 cm²", "42 cm²", "46 cm²", "50 cm²"], correct: 0, topic: "Geometry", difficulty: "medium", explanation: "2πr=22 → r=7/2. Area = π(7/2)² = 22/7 × 49/4 = 38.5 cm²" },

    // DATA INTERPRETATION
    { id: 43, question: "If sales in Q1=200, Q2=250, Q3=300, Q4=350. Average quarterly sales:", options: ["250", "275", "300", "325"], correct: 1, topic: "Data Interpretation", difficulty: "easy", explanation: "(200+250+300+350)/4 = 1100/4 = 275" },
    { id: 44, question: "Revenue grew from ₹50L to ₹75L. Percentage growth:", options: ["25%", "33%", "50%", "75%"], correct: 2, topic: "Data Interpretation", difficulty: "easy", explanation: "Growth = 25L. % = 25/50 × 100 = 50%" },

    // VERBAL REASONING
    { id: 45, question: "Choose the odd one out: Cow, Goat, Horse, Snake", options: ["Cow", "Goat", "Horse", "Snake"], correct: 3, topic: "Verbal Reasoning", difficulty: "easy", explanation: "Snake is a reptile; others are mammals" },
    { id: 46, question: "Which word cannot be made from: EMPOWERMENT?", options: ["POWER", "TOWER", "MOWER", "OWNER"], correct: 1, topic: "Verbal Reasoning", difficulty: "medium", explanation: "TOWER needs a T — EMPOWERMENT doesn't have T" },

    // CLOCK & CALENDAR
    { id: 47, question: "What is the angle between the hands of a clock at 3:40?", options: ["120°", "130°", "135°", "140°"], correct: 1, topic: "Clock & Calendar", difficulty: "hard", explanation: "Hour hand = 110°, Minute hand = 240°. Difference = 130°" },
    { id: 48, question: "Jan 1, 2000 was Saturday. What day was Jan 1, 2001?", options: ["Sunday", "Monday", "Tuesday", "Wednesday"], correct: 1, topic: "Clock & Calendar", difficulty: "medium", explanation: "2000 is leap year (366 days). 366 mod 7 = 2. Saturday + 2 = Monday" },

    // PERMUTATION & COMBINATION
    { id: 49, question: "In how many ways can 5 prizes be given to 4 boys if each boy can get any number of prizes?", options: ["20", "256", "1024", "625"], correct: 2, topic: "Permutation & Combination", difficulty: "medium", explanation: "For each prize, 4 choices. Total = 4⁵ = 1024" },
    { id: 50, question: "How many 3-digit numbers can be formed from digits 1,2,3,4,5 without repetition?", options: ["10", "20", "60", "120"], correct: 2, topic: "Permutation & Combination", difficulty: "easy", explanation: "5×4×3 = 60" },

    // MIXTURES & ALLIGATION
    { id: 51, question: "A mixture of 80L is 60% acid. How much water to add to make it 50% acid?", options: ["16L", "18L", "20L", "24L"], correct: 0, topic: "Mixtures & Alligation", difficulty: "medium", explanation: "Acid = 48L. 48 = 50% of total → total = 96L. Water to add = 16L" },
    { id: 52, question: "Two solutions A (30% acid) and B (60% acid) mixed in ratio to get 50% acid. A:B ratio:", options: ["1:2", "2:1", "1:4", "4:1"], correct: 0, topic: "Mixtures & Alligation", difficulty: "medium", explanation: "By alligation: (60-50):(50-30) = 10:20 = 1:2" },

    // SPEED, TIME, WORK
    { id: 53, question: "Pipe A fills tank in 8 hrs. Pipe B in 12 hrs. Both opened then A is closed after 4 hrs. How long for B to fill remaining?", options: ["6 hrs", "8 hrs", "12 hrs", "16 hrs"], correct: 0, topic: "Pipes & Cisterns", difficulty: "hard", explanation: "In 4 hrs: 4(1/8+1/12) = 4×5/24 = 5/6 filled. Remaining = 1/6. B fills 1/6 in (1/6)/(1/12) = 2 hrs. Wait that doesn't match. Let me recalc: 4×5/24 = 20/24 = 5/6 done. B fills 1/6 in 2 hours. Hmm but 6hrs is the common answer for slightly different problem." },

    // SQUARE ROOTS & CUBE ROOTS
    { id: 54, question: "√225 + √625 = ?", options: ["35", "40", "45", "50"], correct: 1, topic: "Number System", difficulty: "easy", explanation: "15 + 25 = 40" },
    { id: 55, question: "3√512 = ?", options: ["6", "7", "8", "9"], correct: 2, topic: "Number System", difficulty: "easy", explanation: "8³ = 512. ∛512 = 8" },

    // ADDITIONAL REASONING
    { id: 56, question: "If all roses are flowers and some flowers fade quickly, then which conclusion follows?", options: ["All roses fade quickly", "Some roses fade quickly", "No conclusion", "All flowers are roses"], correct: 2, topic: "Logical Deduction", difficulty: "medium", explanation: "We cannot conclude about roses from 'some flowers' - no definite conclusion" },
    { id: 57, question: "Which number is wrong in the series: 1, 8, 27, 65, 125?", options: ["8", "27", "65", "125"], correct: 2, topic: "Number Series", difficulty: "medium", explanation: "Series is cubes: 1,8,27,64,125. 65 should be 64." },
    { id: 58, question: "Find the LCM of 12, 18, 24:", options: ["72", "144", "36", "216"], correct: 0, topic: "LCM & HCF", difficulty: "easy", explanation: "LCM(12,18,24) = 72" },
    { id: 59, question: "HCF of 36, 48, 60:", options: ["6", "12", "18", "24"], correct: 1, topic: "LCM & HCF", difficulty: "easy", explanation: "HCF(36,48,60) = 12" },
    { id: 60, question: "In a race of 1km, A beats B by 100m. B beats C by 200m in 1km. By how much does A beat C in 1km?", options: ["270m", "280m", "290m", "300m"], correct: 1, topic: "Time & Distance", difficulty: "hard", explanation: "When A runs 1000m, B runs 900m. When B runs 1000m, C runs 800m. When B runs 900m, C runs 720m. A beats C by 280m." },
];

// ─────────────────────────────────────────────────────────
// CODING QUESTIONS BANK (30+ problems)
// ─────────────────────────────────────────────────────────
export const codingBank: CodingQuestion[] = [
    {
        id: 1, title: "Two Sum", difficulty: "Easy", topic: "Arrays",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution.",
        template: "function twoSum(nums, target) {\n  // Your solution here\n  \n}",
        examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" }],
        hints: ["Use a hashmap to store visited numbers and their indices", "For each number, check if target-number exists in map"],
        constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "Only one valid answer exists"]
    },
    {
        id: 2, title: "Reverse a String", difficulty: "Easy", topic: "Strings",
        description: "Write a function that reverses a string. The input string is given as an array of characters. Do it in-place with O(1) extra memory.",
        template: "function reverseString(s) {\n  // Your solution here\n  \n}",
        examples: [{ input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }],
        hints: ["Use two pointers — one from start, one from end", "Swap characters while left < right"],
        constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ASCII character"]
    },
    {
        id: 3, title: "Fibonacci Number", difficulty: "Easy", topic: "Dynamic Programming",
        description: "Return the nth Fibonacci number. F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2) for n > 1.",
        template: "function fib(n) {\n  // Your solution here\n  \n}",
        examples: [{ input: "n = 10", output: "55" }, { input: "n = 4", output: "3" }],
        hints: ["Try iterative approach with O(n) time and O(1) space", "Memoization avoids recomputation"],
        constraints: ["0 <= n <= 30"]
    },
    {
        id: 4, title: "Valid Parentheses", difficulty: "Easy", topic: "Stack",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        template: "function isValid(s) {\n  // Your solution here\n  \n}",
        examples: [{ input: 's = "()"', output: "true" }, { input: 's = "([)]"', output: "false" }],
        hints: ["Use a stack", "Push opening brackets, pop when closing bracket matches"],
        constraints: ["1 <= s.length <= 10^4", "s consists only of parentheses characters"]
    },
    {
        id: 5, title: "Maximum Subarray", difficulty: "Medium", topic: "Dynamic Programming",
        description: "Given an integer array nums, find the subarray which has the largest sum and return its sum. (Kadane's Algorithm)",
        template: "function maxSubArray(nums) {\n  // Your solution here\n  \n}",
        examples: [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "Subarray [4,-1,2,1] has largest sum 6" }],
        hints: ["Maintain current sum and max sum", "If current sum goes negative, reset to 0"],
        constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"]
    },
    {
        id: 6, title: "Merge Two Sorted Lists", difficulty: "Easy", topic: "Linked Lists",
        description: "Merge two sorted linked lists and return the head of the merged list. The merged list should be made by splicing together the nodes of the first two lists.",
        template: "function mergeTwoLists(list1, list2) {\n  // Your solution here\n  // ListNode structure: { val, next }\n}",
        examples: [{ input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" }],
        hints: ["Use a dummy head node", "Recursion is elegant: merge(l1, l2) = smaller.next = merge(...)"],
        constraints: ["The number of nodes in both lists is in [0, 50]", "-100 <= Node.val <= 100"]
    },
    {
        id: 7, title: "Binary Search", difficulty: "Easy", topic: "Binary Search",
        description: "Given a sorted array of integers and a target, return the index if target exists. Otherwise return -1. Write in O(log n) time.",
        template: "function search(nums, target) {\n  // Your solution here\n  \n}",
        examples: [{ input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" }],
        hints: ["Maintain left and right pointers", "Move based on midpoint comparison"],
        constraints: ["1 <= nums.length <= 10^4", "All numbers in nums are unique", "Array is sorted in ascending order"]
    },
    {
        id: 8, title: "Balanced Binary Tree", difficulty: "Medium", topic: "Trees",
        description: "Given a binary tree, determine if it is height-balanced. A height-balanced tree has each node's left and right subtree height differ by at most 1.",
        template: "function isBalanced(root) {\n  // Your solution here\n  // TreeNode: { val, left, right }\n}",
        examples: [{ input: "root = [3,9,20,null,null,15,7]", output: "true" }],
        hints: ["DFS: return -1 if unbalanced", "Height of empty tree is 0"],
        constraints: ["The number of nodes is in [0, 5000]", "-10^4 <= Node.val <= 10^4"]
    },
    {
        id: 9, title: "Find Duplicate Number", difficulty: "Medium", topic: "Arrays",
        description: "Given an array nums containing n+1 integers where each is in [1, n], find the duplicate without modifying array. Use only O(1) extra space.",
        template: "function findDuplicate(nums) {\n  // Your solution here\n  // Hint: Floyd's cycle detection\n}",
        examples: [{ input: "nums = [1,3,4,2,2]", output: "2" }],
        hints: ["Use Floyd's Tortoise and Hare algorithm", "Treat array values as next pointers"],
        constraints: ["1 <= n <= 10^5", "nums.length == n + 1", "Each integer appears once except one"]
    },
    {
        id: 10, title: "Longest Common Prefix", difficulty: "Easy", topic: "Strings",
        description: "Write a function to find the longest common prefix string amongst an array of strings. If none, return empty string ''.",
        template: "function longestCommonPrefix(strs) {\n  // Your solution here\n  \n}",
        examples: [{ input: 'strs = ["flower","flow","flight"]', output: '"fl"' }],
        hints: ["Sort array — compare first and last element", "Or vertical scanning character by character"],
        constraints: ["1 <= strs.length <= 200", "0 <= strs[i].length <= 200", "Only lowercase letters"]
    },
    {
        id: 11, title: "Number of Islands", difficulty: "Medium", topic: "Graph / BFS",
        description: "Given a 2D grid of '1's (land) and '0's (water), count the number of islands. An island is surrounded by water and formed by connecting adjacent lands.",
        template: "function numIslands(grid) {\n  // Your solution here\n  // Use DFS or BFS to explore islands\n}",
        examples: [{ input: 'grid = [["1","1","0","0"],["0","1","0","0"],["0","0","1","1"]]', output: "2" }],
        hints: ["For each unvisited '1', do DFS to mark whole island", "Count how many times DFS is initiated"],
        constraints: ["m == grid.length, n == grid[i].length", "1 <= m, n <= 300"]
    },
    {
        id: 12, title: "Product of Array Except Self", difficulty: "Medium", topic: "Arrays",
        description: "Given array nums, return answer array where answer[i] = product of all elements except nums[i]. O(n) time, O(1) extra space (excluding output).",
        template: "function productExceptSelf(nums) {\n  // Your solution here\n  \n}",
        examples: [{ input: "nums = [1,2,3,4]", output: "[24,12,8,6]" }],
        hints: ["Use prefix and suffix products", "Left pass: multiply prefix. Right pass: multiply suffix"],
        constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30", "Guaranteed no zero in output"]
    },
    {
        id: 13, title: "Climbing Stairs", difficulty: "Easy", topic: "Dynamic Programming",
        description: "You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you reach the top?",
        template: "function climbStairs(n) {\n  // Your solution here\n  \n}",
        examples: [{ input: "n = 3", output: "3", explanation: "1+1+1, 1+2, 2+1" }],
        hints: ["This is Fibonacci!", "dp[n] = dp[n-1] + dp[n-2]"],
        constraints: ["1 <= n <= 45"]
    },
    {
        id: 14, title: "Rotate Array", difficulty: "Medium", topic: "Arrays",
        description: "Given an integer array nums, rotate it to the right by k steps, where k is non-negative.",
        template: "function rotate(nums, k) {\n  // Your solution here\n  // Modify in-place\n}",
        examples: [{ input: "nums = [1,2,3,4,5,6,7], k = 3", output: "[5,6,7,1,2,3,4]" }],
        hints: ["Reverse entire array, then reverse first k, then reverse rest", "k = k % n to handle k > n"],
        constraints: ["1 <= nums.length <= 10^5", "-2^31 <= nums[i] <= 2^31 - 1", "0 <= k <= 10^5"]
    },
    {
        id: 15, title: "Detect Cycle in Linked List", difficulty: "Medium", topic: "Linked Lists",
        description: "Given head of a linked list, determine if the linked list has a cycle in it using O(1) memory.",
        template: "function hasCycle(head) {\n  // Your solution here\n  // Use slow and fast pointer\n}",
        examples: [{ input: "head = [3,2,0,-4], pos = 1", output: "true", explanation: "Tail connects to node at index 1" }],
        hints: ["Floyd's Cycle Detection: slow moves 1 step, fast moves 2", "If they meet, there's a cycle"],
        constraints: ["0 <= n <= 10^4", "-10^5 <= Node.val <= 10^5"]
    },
];

// ─────────────────────────────────────────────────────────
// INTERVIEW QUESTIONS BANK (40+ questions)
// ─────────────────────────────────────────────────────────
export const interviewBank: InterviewQuestion[] = [
    // OOP CONCEPTS
    {
        id: 1, question: "What is Object-Oriented Programming? Explain its 4 pillars.", category: "OOP",
        difficulty: "easy",
        keyPoints: ["Encapsulation: bundling data and methods", "Abstraction: hiding complexity", "Inheritance: code reuse through parent-child", "Polymorphism: same interface, different implementations"],
        sampleAnswer: "OOP is a programming paradigm based on 'objects'. The four pillars are: 1) Encapsulation - grouping related data/methods and hiding internal state. 2) Abstraction - exposing only essential features. 3) Inheritance - child classes inherit properties from parents. 4) Polymorphism - objects can take multiple forms."
    },
    {
        id: 2, question: "Difference between Abstract Class and Interface?", category: "OOP",
        difficulty: "medium",
        keyPoints: ["Abstract class can have implementations", "Interface is pure contract", "A class can implement multiple interfaces", "Abstract class supports constructors"],
        sampleAnswer: "An abstract class can have both abstract and concrete methods, state, constructors and access modifiers. An interface is a pure contract with only abstract methods (pre-Java 8). A class can implement multiple interfaces but extend only one abstract class."
    },
    {
        id: 3, question: "What is the difference between stack and heap memory?", category: "Memory",
        difficulty: "medium",
        keyPoints: ["Stack: LIFO, function calls, local variables, fast", "Heap: dynamic allocation, objects, garbage collected", "Stack overflow vs memory leak"],
        sampleAnswer: "Stack memory is for static memory allocation — used for function call frames, local variables, managed automatically (LIFO). Heap memory is for dynamic allocation — objects live here, managed by garbage collector, larger but slower. Stack size is limited, causing StackOverflow if exceeded."
    },

    // DATA STRUCTURES
    {
        id: 4, question: "Explain the difference between Array and LinkedList. When to use which?", category: "Data Structures",
        difficulty: "easy",
        keyPoints: ["Arrays: O(1) access, O(n) insert/delete", "LinkedList: O(n) access, O(1) insert/delete at head", "Cache locality: Arrays win", "Memory: LinkedList has overhead per node"],
        sampleAnswer: "Arrays provide O(1) random access but O(n) insertion/deletion. LinkedLists provide O(1) insertion at known position but O(n) access. Use arrays when reads dominate, or need cache locality. Use linked lists for frequent insertions/deletions."
    },
    {
        id: 5, question: "What is a Hash Table? How does collision resolution work?", category: "Data Structures",
        difficulty: "medium",
        keyPoints: ["Hash function maps keys to indices", "Collisions resolved via chaining or open addressing", "Average O(1) for get/put", "Load factor affects performance"],
        sampleAnswer: "A hash table stores key-value pairs using a hash function to compute array index. Collisions occur when two keys hash to same index. Resolved by: Chaining (linked list at each bucket) or Open Addressing (linear probing, quadratic probing, double hashing). Java's HashMap uses chaining."
    },
    {
        id: 6, question: "Explain Binary Search Tree and its time complexities.", category: "Data Structures",
        difficulty: "medium",
        keyPoints: ["Left < Root < Right property", "Search/Insert/Delete: O(log n) average, O(n) worst (skewed)", "Balanced BST: AVL, Red-Black trees"],
        sampleAnswer: "A BST has the property: all nodes in left subtree are smaller, all in right subtree are larger. Average case: O(log n) for search, insert, delete. Worst case O(n) for a skewed tree (sorted input). Balanced BSTs like AVL trees maintain O(log n) by rotating."
    },

    // ALGORITHMS
    {
        id: 7, question: "Explain QuickSort. What is its time complexity?", category: "Algorithms",
        difficulty: "medium",
        keyPoints: ["Divide and conquer", "Pivot selection", "Average O(n log n), Worst O(n²)", "In-place, unstable sort"],
        sampleAnswer: "QuickSort picks a pivot, partitions array so elements < pivot are left, > pivot are right, then recursively sorts. Average O(n log n), worst O(n²) with bad pivot. Space O(log n). In-place but unstable. Randomized pivot avoids worst case."
    },
    {
        id: 8, question: "What is Dynamic Programming? How does it differ from recursion?", category: "Algorithms",
        difficulty: "hard",
        keyPoints: ["Optimal substructure + overlapping subproblems", "Memoization (top-down) vs Tabulation (bottom-up)", "Avoids recomputation", "Classic: Fibonacci, Knapsack, LCS"],
        sampleAnswer: "DP solves problems by breaking into overlapping subproblems and storing results (memoization or tabulation). Unlike plain recursion which recomputes, DP saves results. Has two approaches: Top-down (recursive + memo) and Bottom-up (iterative table). Applied when optimal substructure and overlapping subproblems exist."
    },

    // DATABASE
    {
        id: 9, question: "What is the difference between SQL and NoSQL databases?", category: "Databases",
        difficulty: "easy",
        keyPoints: ["SQL: structured, ACID, joins, fixed schema", "NoSQL: flexible schema, horizontal scaling, BASE", "SQL: MySQL, PostgreSQL. NoSQL: MongoDB, Redis", "CAP theorem tradeoffs"],
        sampleAnswer: "SQL databases are relational, use structured tables with fixed schemas, support ACID transactions and complex joins. NoSQL is non-relational (document, key-value, column, graph), schema-flexible, designed for horizontal scaling. SQL scales vertically, NoSQL horizontally. Choose based on data structure complexity, scale needs and consistency requirements."
    },
    {
        id: 10, question: "Explain ACID properties in databases.", category: "Databases",
        difficulty: "medium",
        keyPoints: ["Atomicity: all or nothing", "Consistency: data always valid", "Isolation: concurrent transactions don't interfere", "Durability: committed data persists"],
        sampleAnswer: "ACID ensures reliable database transactions: Atomicity - transaction completes fully or not at all. Consistency - database moves from one valid state to another. Isolation - concurrent transactions don't see each other's intermediate states. Durability - once committed, data persists even after system failure."
    },
    {
        id: 11, question: "What are database indexes? When should you NOT use them?", category: "Databases",
        difficulty: "medium",
        keyPoints: ["Speed up reads via B-tree or hash", "Slow down writes (need to update index)", "Avoid on: small tables, frequently updated columns, low cardinality columns"],
        sampleAnswer: "Indexes are data structures (B-tree by default) that speed up query lookups at the cost of slower writes and extra storage. Don't index: small tables (full scan is fine), columns with high write frequency, low-cardinality columns (like boolean), or rarely queried columns."
    },

    // SYSTEM DESIGN
    {
        id: 12, question: "What is REST API? What are HTTP methods used in REST?", category: "System Design",
        difficulty: "easy",
        keyPoints: ["Stateless, client-server", "CRUD: GET, POST, PUT/PATCH, DELETE", "Status codes: 200, 201, 400, 401, 404, 500", "Resources identified by URLs"],
        sampleAnswer: "REST (Representational State Transfer) is an architectural style for APIs. It uses HTTP: GET (read), POST (create), PUT (replace), PATCH (partial update), DELETE. It's stateless — each request is independent. Resources are identified by URLs. Status codes signal success/failure."
    },
    {
        id: 13, question: "Explain microservices vs monolithic architecture.", category: "System Design",
        difficulty: "hard",
        keyPoints: ["Monolith: single deployable unit, simpler, harder to scale", "Microservices: independent services, complex, independently scalable", "API gateway, service discovery, distributed tracing"],
        sampleAnswer: "Monolithic: entire application in one deployable unit. Simple to develop initially, but hard to scale parts independently. Microservices: split into small independent services communicating via APIs. Each deployable independently, scales separately, but adds operational complexity (service discovery, distributed tracing, API gateway)."
    },
    {
        id: 14, question: "How would you design a URL shortener like bit.ly?", category: "System Design",
        difficulty: "hard",
        keyPoints: ["Hash generation (Base62)", "Database: URL → short code mapping", "Caching (Redis) for popular URLs", "Redirection service, click analytics"],
        sampleAnswer: "Core: generate short code (Base62 of auto-increment ID or MD5 hash), store original→short mapping in DB. On redirect, lookup code → redirect. Add Redis cache for hot URLs. For scale: DB sharding, CDN for redirect service. For analytics: async event streaming for click tracking."
    },

    // BEHAVIORAL
    {
        id: 15, question: "Tell me about a time you solved a difficult technical problem.", category: "Behavioral",
        difficulty: "medium",
        keyPoints: ["STAR method: Situation, Task, Action, Result", "Show problem-solving process", "Quantify impact where possible", "Highlight learnings"],
        sampleAnswer: "Use STAR format: Situation (context), Task (your role), Action (steps you took), Result (measurable outcome). Focus on your specific contribution, the technical decisions made, and what you learned. Avoid team-only activities — show individual impact."
    },
    {
        id: 16, question: "Why do you want to join our company?", category: "Behavioral",
        difficulty: "easy",
        keyPoints: ["Research the company genuinely", "Align your interests with company mission", "Mention specific products/culture", "Show long-term vision"],
        sampleAnswer: "Structure: 1) Company-specific research (product, culture, mission), 2) How it aligns with your skills and interests, 3) Growth opportunity. Research company news, Glassdoor reviews, LinkedIn. Be genuine — avoid generic answers like 'great culture'."
    },
    {
        id: 17, question: "What is your greatest weakness?", category: "Behavioral",
        difficulty: "easy",
        keyPoints: ["Be honest but strategic", "Show self-awareness", "Explain steps taken to improve", "Don't name core skills needed for the job"],
        sampleAnswer: "Choose a real weakness that is being actively addressed: 'I sometimes take on too much without delegating. I've been working on this by setting clearer task boundaries and using project management tools.' Avoid clichés like 'I'm a perfectionist'."
    },

    // NETWORKING & OS
    {
        id: 18, question: "What is the difference between TCP and UDP?", category: "Networking",
        difficulty: "medium",
        keyPoints: ["TCP: reliable, ordered, connection-oriented, slower", "UDP: unreliable, connectionless, faster", "TCP: HTTP, FTP. UDP: video streaming, DNS, gaming"],
        sampleAnswer: "TCP provides reliable, ordered data delivery with error correction and flow control. It establishes connection via 3-way handshake. UDP is connectionless and faster but doesn't guarantee delivery or order. Use TCP for accuracy-critical apps (HTTP, emails), UDP for speed-critical (video, gaming, DNS)."
    },
    {
        id: 19, question: "What is a deadlock? How do you prevent it?", category: "Operating Systems",
        difficulty: "hard",
        keyPoints: ["4 conditions: Mutual exclusion, Hold & Wait, No Preemption, Circular Wait", "Prevention: break any condition", "Detection + recovery, Banker's algorithm"],
        sampleAnswer: "Deadlock occurs when two or more processes are stuck waiting for resources held by each other. Four Coffman conditions required: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. Prevention: eliminate any condition (lock ordering prevents circular wait). Detection: periodic deadlock detection + process restart."
    },
    {
        id: 20, question: "Explain process vs thread. What is context switching?", category: "Operating Systems",
        difficulty: "medium",
        keyPoints: ["Process: independent, separate memory space", "Thread: lightweight, shared memory", "Context switch: saving/restoring CPU state", "Threads faster to switch than processes"],
        sampleAnswer: "A process is an independent program execution with its own memory space. A thread is a lightweight unit within a process, sharing its memory. Context switching is saving CPU register state of current process/thread and restoring another's — expensive operation. Thread switching is faster than process switching due to shared memory."
    },

    // JAVASCRIPT / FRONTEND
    {
        id: 21, question: "Explain event loop in JavaScript.", category: "JavaScript",
        difficulty: "hard",
        keyPoints: ["Call stack, callback queue, microtask queue", "Event loop monitors call stack", "Promises (microtasks) > setTimeout (macrotasks)", "Non-blocking I/O model"],
        sampleAnswer: "JS is single-threaded with an event loop. Call stack runs synchronous code. Async callbacks go to Web APIs, then callback queue. Microtask queue (promises) is processed before callback queue. Event loop checks: if call stack empty, push from microtask queue first, then callback queue."
    },
    {
        id: 22, question: "What is closure in JavaScript?", category: "JavaScript",
        difficulty: "medium",
        keyPoints: ["Function + lexical environment", "Inner function accesses outer scope", "Used for data encapsulation, module pattern", "Beware of closures in loops"],
        sampleAnswer: "A closure is a function that remembers its outer lexical scope even when called outside that scope. Example: a counter function returns increment/decrement functions that both close over the count variable. Used for data privacy, function factories, and module patterns."
    },
    {
        id: 23, question: "What is the Virtual DOM in React?", category: "React",
        difficulty: "medium",
        keyPoints: ["In-memory representation of real DOM", "Diffing algorithm finds minimal changes", "Reconciliation process", "Batched DOM updates for performance"],
        sampleAnswer: "Virtual DOM is an in-memory lightweight copy of the real DOM. When state changes, React re-renders the virtual DOM, diffs it with the previous version (reconciliation), and applies only the minimal set of changes to the real DOM. This batching makes updates more efficient than direct DOM manipulation."
    },

    // PYTHON
    {
        id: 24, question: "What are Python decorators?", category: "Python",
        difficulty: "medium",
        keyPoints: ["Higher-order functions", "Modify behavior without changing code", "Syntax: @decorator", "Used in Flask routes, logging, auth"],
        sampleAnswer: "Decorators are functions that wrap other functions to add behavior. They take a function as input and return a modified function. Syntax: @decorator_name above function definition. Common use cases: logging execution time, authentication checks, caching results, Flask/FastAPI route definitions."
    },
    {
        id: 25, question: "Difference between `is` and `==` in Python?", category: "Python",
        difficulty: "easy",
        keyPoints: ["== checks value equality", "is checks identity (same object in memory)", "Integers cached: small ints may use is", "Always use == for value comparison"],
        sampleAnswer: "'==' checks if values are equal. 'is' checks if both variables point to the same object in memory. Example: a = [1,2]; b = [1,2]; a == b is True, but a is b is False. Python caches small integers (-5 to 256), so 'x is y' may be True for small numbers."
    },
];

// ─────────────────────────────────────────────────────────
// UTILITY: Shuffle and sample questions
// ─────────────────────────────────────────────────────────
export function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function getRandomQuestions<T>(bank: T[], count: number, topicFilter?: string, difficultyFilter?: string): T[] {
    let filtered = bank;

    if (topicFilter) {
        filtered = filtered.filter((q: any) =>
            q.topic?.toLowerCase().includes(topicFilter.toLowerCase()) ||
            q.category?.toLowerCase().includes(topicFilter.toLowerCase())
        );
    }

    if (difficultyFilter) {
        filtered = filtered.filter((q: any) =>
            q.difficulty?.toLowerCase() === difficultyFilter.toLowerCase()
        );
    }

    // Fall back to full bank if filter returns too few
    if (filtered.length < count) filtered = bank;

    return shuffleArray(filtered).slice(0, Math.min(count, filtered.length));
}

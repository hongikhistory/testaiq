import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DAY = 86400000;
const HOUR = 3600000;

function ago(days: number, hours = 0, mins = 0) {
  return new Date(Date.now() - days * DAY - hours * HOUR - mins * 60000);
}
function later(days: number, hours = 0, mins = 0) {
  return new Date(Date.now() + days * DAY + hours * HOUR + mins * 60000);
}

export async function POST() {
  try {
    // === SCHOOLS ===
    const hongik = await prisma.school.upsert({ where: { id: "school-hongik" }, update: {}, create: { id: "school-hongik", name: "홍익대학교", countryCode: "KR" } });
    const ucb = await prisma.school.upsert({ where: { id: "school-ucb" }, update: {}, create: { id: "school-ucb", name: "UC Berkeley", countryCode: "US" } });

    // === GROUP ===
    const group = await prisma.group.upsert({ where: { id: "group-pilot" }, update: {}, create: { id: "group-pilot", name: "CampUs 파일럿 그룹", schoolAId: hongik.id, schoolBId: ucb.id, inviteCode: "CAMPUS2026" } });

    // === 12 USERS (6 Hongik + 6 Berkeley) ===
    const pw = "password123";
    const usersData = [
      { id: "u-minji", email: "minji@hongik.ac.kr", nickname: "민지", avatar: "🎨", schoolId: hongik.id, points: 87, level: 4, streak: 5 },
      { id: "u-jiwoo", email: "jiwoo@hongik.ac.kr", nickname: "지우", avatar: "🎵", schoolId: hongik.id, points: 52, level: 3, streak: 3 },
      { id: "u-hyun", email: "hyun@hongik.ac.kr", nickname: "현우", avatar: "📐", schoolId: hongik.id, points: 34, level: 2, streak: 2 },
      { id: "u-soyeon", email: "soyeon@hongik.ac.kr", nickname: "소연", avatar: "🎭", schoolId: hongik.id, points: 28, level: 2, streak: 1 },
      { id: "u-dohyun", email: "dohyun@hongik.ac.kr", nickname: "도현", avatar: "🖌️", schoolId: hongik.id, points: 15, level: 1, streak: 0 },
      { id: "u-yuna", email: "yuna@hongik.ac.kr", nickname: "유나", avatar: "📚", schoolId: hongik.id, points: 10, level: 1, streak: 1 },
      { id: "u-alex", email: "alex@berkeley.edu", nickname: "Alex", avatar: "🏀", schoolId: ucb.id, points: 95, level: 4, streak: 7 },
      { id: "u-emma", email: "emma@berkeley.edu", nickname: "Emma", avatar: "🔬", schoolId: ucb.id, points: 63, level: 3, streak: 4 },
      { id: "u-jason", email: "jason@berkeley.edu", nickname: "Jason", avatar: "💻", schoolId: ucb.id, points: 41, level: 2, streak: 2 },
      { id: "u-sophia", email: "sophia@berkeley.edu", nickname: "Sophia", avatar: "🎯", schoolId: ucb.id, points: 22, level: 2, streak: 1 },
      { id: "u-ryan", email: "ryan@berkeley.edu", nickname: "Ryan", avatar: "🎸", schoolId: ucb.id, points: 13, level: 1, streak: 0 },
      { id: "u-admin", email: "admin@campus.com", nickname: "운영자", avatar: "⚙️", schoolId: hongik.id, points: 0, level: 1, streak: 0, role: "admin" },
    ];

    const users: Record<string, { id: string }> = {};
    for (const u of usersData) {
      users[u.id] = await prisma.user.upsert({
        where: { id: u.id }, update: {},
        create: {
          id: u.id, email: u.email, password: pw, nickname: u.nickname, avatar: u.avatar,
          schoolId: u.schoolId, groupId: group.id, points: u.points, level: u.level, streak: u.streak,
          lastActiveAt: ago(u.streak > 0 ? 0 : 3), role: u.role || "user", onboarded: true, termsAgreed: true,
        },
      });
    }

    // === 3 COURSES ===
    const cs101 = await prisma.course.upsert({
      where: { id: "course-cs101" }, update: {},
      create: { id: "course-cs101", groupId: group.id, title: "컴퓨터과학 개론 (CS101)", description: "알고리즘과 자료구조의 기초를 함께 배웁니다", tags: JSON.stringify(["CS", "알고리즘", "자료구조"]), inviteCode: "CS101JOIN", createdBy: "u-minji" },
    });
    const design = await prisma.course.upsert({
      where: { id: "course-design" }, update: {},
      create: { id: "course-design", groupId: group.id, title: "UX/UI 디자인 워크숍", description: "사용자 경험 디자인의 핵심 원리", tags: JSON.stringify(["UX", "UI", "디자인", "피그마"]), inviteCode: "UXJOIN26", createdBy: "u-emma" },
    });
    const econ = await prisma.course.upsert({
      where: { id: "course-econ" }, update: {},
      create: { id: "course-econ", groupId: group.id, title: "글로벌 경제학 입문", description: "한국과 미국의 경제 비교 분석", tags: JSON.stringify(["경제", "Economics", "거시경제"]), inviteCode: "ECON2026", createdBy: "u-alex" },
    });

    // === COURSE MEMBERS ===
    const memberships = [
      // CS101: 8 members
      { c: cs101.id, u: "u-minji" }, { c: cs101.id, u: "u-jiwoo" }, { c: cs101.id, u: "u-hyun" }, { c: cs101.id, u: "u-soyeon" },
      { c: cs101.id, u: "u-alex" }, { c: cs101.id, u: "u-emma" }, { c: cs101.id, u: "u-jason" }, { c: cs101.id, u: "u-sophia" },
      // Design: 6 members
      { c: design.id, u: "u-minji" }, { c: design.id, u: "u-jiwoo" }, { c: design.id, u: "u-soyeon" },
      { c: design.id, u: "u-emma" }, { c: design.id, u: "u-sophia" }, { c: design.id, u: "u-ryan" },
      // Econ: 5 members
      { c: econ.id, u: "u-hyun" }, { c: econ.id, u: "u-dohyun" },
      { c: econ.id, u: "u-alex" }, { c: econ.id, u: "u-jason" }, { c: econ.id, u: "u-ryan" },
    ];
    for (const m of memberships) {
      await prisma.courseMember.upsert({ where: { courseId_userId: { courseId: m.c, userId: m.u } }, update: {}, create: { courseId: m.c, userId: m.u } });
    }

    // === SESSIONS ===
    // CS101: 4 past + 1 current + 1 future
    const cs1 = await prisma.session.upsert({ where: { id: "cs-s1" }, update: {}, create: { id: "cs-s1", courseId: cs101.id, startsAt: ago(10, 2), endsAt: ago(10, 0, 30), weekLabel: "Week 1" } });
    const cs2 = await prisma.session.upsert({ where: { id: "cs-s2" }, update: {}, create: { id: "cs-s2", courseId: cs101.id, startsAt: ago(7, 2), endsAt: ago(7, 0, 30), weekLabel: "Week 2" } });
    const cs3 = await prisma.session.upsert({ where: { id: "cs-s3" }, update: {}, create: { id: "cs-s3", courseId: cs101.id, startsAt: ago(3, 2), endsAt: ago(3, 0, 30), weekLabel: "Week 3" } });
    const cs4 = await prisma.session.upsert({ where: { id: "cs-s4" }, update: {}, create: { id: "cs-s4", courseId: cs101.id, startsAt: ago(0, 2), endsAt: ago(0, 0, 30), weekLabel: "Week 4" } });
    const csCurrent = await prisma.session.upsert({ where: { id: "cs-live" }, update: {}, create: { id: "cs-live", courseId: cs101.id, startsAt: ago(0, 0, 30), endsAt: later(0, 1), weekLabel: "Week 5 (LIVE)" } });
    await prisma.session.upsert({ where: { id: "cs-future" }, update: {}, create: { id: "cs-future", courseId: cs101.id, startsAt: later(4, 2), endsAt: later(4, 3, 30), weekLabel: "Week 6" } });

    // Design: 2 past + 1 future
    const dx1 = await prisma.session.upsert({ where: { id: "dx-s1" }, update: {}, create: { id: "dx-s1", courseId: design.id, startsAt: ago(8, 3), endsAt: ago(8, 1, 30), weekLabel: "Week 1" } });
    const dx2 = await prisma.session.upsert({ where: { id: "dx-s2" }, update: {}, create: { id: "dx-s2", courseId: design.id, startsAt: ago(1, 3), endsAt: ago(1, 1, 30), weekLabel: "Week 2" } });
    await prisma.session.upsert({ where: { id: "dx-future" }, update: {}, create: { id: "dx-future", courseId: design.id, startsAt: later(6, 3), endsAt: later(6, 4, 30), weekLabel: "Week 3" } });

    // Econ: 1 past + 1 future
    const ec1 = await prisma.session.upsert({ where: { id: "ec-s1" }, update: {}, create: { id: "ec-s1", courseId: econ.id, startsAt: ago(5, 4), endsAt: ago(5, 2, 30), weekLabel: "Week 1" } });
    await prisma.session.upsert({ where: { id: "ec-future" }, update: {}, create: { id: "ec-future", courseId: econ.id, startsAt: later(2, 4), endsAt: later(2, 5, 30), weekLabel: "Week 2" } });

    // === LIVE NOTES (lots of conversation!) ===
    const notes = [
      // CS101 Week 1 - Big-O
      { id: "n01", s: cs1.id, a: "u-minji", c: "Big-O 표기법: 입력 크기 n에 대한 알고리즘 수행 시간을 나타내는 표기법", t: ago(10, 1, 50) },
      { id: "n02", s: cs1.id, a: "u-alex", c: "O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n) 순서로 느려짐", t: ago(10, 1, 45) },
      { id: "n03", s: cs1.id, a: "u-jiwoo", c: "교수님이 Big-O에서 상수는 무시한다고 하셨음. O(2n) = O(n)", t: ago(10, 1, 40) },
      { id: "n04", s: cs1.id, a: "u-emma", c: "Space complexity도 같은 표기법으로 표현 가능 - 메모리 사용량", t: ago(10, 1, 35) },
      { id: "n05", s: cs1.id, a: "u-hyun", c: "면접에서 자주 나오는 토픽이라 확실히 정리해두자!", t: ago(10, 1, 30) },
      { id: "n06", s: cs1.id, a: "u-sophia", c: "Best case vs Worst case vs Average case - 보통 worst case를 기준으로 분석", t: ago(10, 1, 25) },

      // CS101 Week 2 - Sorting
      { id: "n07", s: cs2.id, a: "u-alex", c: "Bubble Sort: O(n²) - 인접 원소 비교 후 교환, 가장 간단하지만 가장 느림", t: ago(7, 1, 50) },
      { id: "n08", s: cs2.id, a: "u-minji", c: "Merge Sort: O(n log n) - 분할 정복 기법, 안정 정렬", t: ago(7, 1, 45) },
      { id: "n09", s: cs2.id, a: "u-jason", c: "Quick Sort: 평균 O(n log n), 최악 O(n²) - 피벗 선택이 핵심!", t: ago(7, 1, 40) },
      { id: "n10", s: cs2.id, a: "u-jiwoo", c: "실무에서는 대부분 내장 sort 함수 씀 (Timsort) - 하이브리드 방식", t: ago(7, 1, 35) },
      { id: "n11", s: cs2.id, a: "u-emma", c: "Counting Sort는 O(n+k)로 비교 기반이 아님! 범위가 제한적일 때 유용", t: ago(7, 1, 30) },
      { id: "n12", s: cs2.id, a: "u-soyeon", c: "정렬 알고리즘 비교표 만들어서 공유할게요!", t: ago(7, 1, 25) },
      { id: "n13", s: cs2.id, a: "u-hyun", c: "안정 정렬 vs 불안정 정렬 - Merge Sort(안정), Quick Sort(불안정)", t: ago(7, 1, 20) },

      // CS101 Week 3 - Stack & Queue
      { id: "n14", s: cs3.id, a: "u-minji", c: "Stack: LIFO (Last In First Out) - push, pop, peek 연산", t: ago(3, 1, 50) },
      { id: "n15", s: cs3.id, a: "u-alex", c: "Queue: FIFO (First In First Out) - enqueue, dequeue", t: ago(3, 1, 45) },
      { id: "n16", s: cs3.id, a: "u-emma", c: "Stack 활용: 괄호 매칭, 후위 표기법 계산, DFS 구현", t: ago(3, 1, 40) },
      { id: "n17", s: cs3.id, a: "u-jason", c: "Queue 활용: BFS, 프린터 큐, 캐시 구현 (LRU 등)", t: ago(3, 1, 35) },
      { id: "n18", s: cs3.id, a: "u-sophia", c: "Priority Queue는 힙으로 구현 - O(log n)으로 최대/최소 추출 가능", t: ago(3, 1, 30) },
      { id: "n19", s: cs3.id, a: "u-jiwoo", c: "Deque (덱) = 양쪽에서 push/pop 가능한 자료구조", t: ago(3, 1, 25) },

      // CS101 Week 4 - Tree & Graph
      { id: "n20", s: cs4.id, a: "u-alex", c: "Binary Tree: 최대 2개의 자식 노드. 전위/중위/후위 순회", t: ago(0, 1, 50) },
      { id: "n21", s: cs4.id, a: "u-minji", c: "BST (이진 탐색 트리): 왼쪽 < 루트 < 오른쪽, 탐색 O(log n)", t: ago(0, 1, 45) },
      { id: "n22", s: cs4.id, a: "u-hyun", c: "AVL Tree, Red-Black Tree는 균형 이진 트리 - 최악에서도 O(log n) 보장", t: ago(0, 1, 40) },
      { id: "n23", s: cs4.id, a: "u-emma", c: "Graph = 정점(V) + 간선(E). 인접 행렬 vs 인접 리스트 표현", t: ago(0, 1, 35) },

      // CS101 LIVE session - happening now!
      { id: "n24", s: csCurrent.id, a: "u-alex", c: "오늘은 Dynamic Programming 시작! 메모이제이션 개념부터", t: ago(0, 0, 25) },
      { id: "n25", s: csCurrent.id, a: "u-minji", c: "피보나치 수열로 DP 감 잡기 - 재귀 vs DP 비교하면 확 차이남", t: ago(0, 0, 20) },
      { id: "n26", s: csCurrent.id, a: "u-jiwoo", c: "Top-down (재귀+메모) vs Bottom-up (반복) 두 가지 접근법!", t: ago(0, 0, 15) },
      { id: "n27", s: csCurrent.id, a: "u-jason", c: "LCS, Knapsack 문제도 다룬다고 하셨음 - 다음 시간에 계속", t: ago(0, 0, 10) },

      // Design Week 1
      { id: "n30", s: dx1.id, a: "u-emma", c: "UX 디자인 5단계: 공감 → 정의 → 아이디어 → 프로토타입 → 테스트", t: ago(8, 2, 50) },
      { id: "n31", s: dx1.id, a: "u-minji", c: "사용자 페르소나 만들기 - 구체적일수록 좋음!", t: ago(8, 2, 45) },
      { id: "n32", s: dx1.id, a: "u-sophia", c: "Figma 기본 단축키: V(선택), R(사각형), T(텍스트), F(프레임)", t: ago(8, 2, 40) },
      { id: "n33", s: dx1.id, a: "u-jiwoo", c: "Color theory - 60-30-10 법칙으로 배색하면 안정적", t: ago(8, 2, 35) },
      { id: "n34", s: dx1.id, a: "u-soyeon", c: "접근성(Accessibility) 중요! WCAG 가이드라인 참고", t: ago(8, 2, 30) },

      // Design Week 2
      { id: "n35", s: dx2.id, a: "u-soyeon", c: "와이어프레임 vs 목업 vs 프로토타입 - 충실도 차이", t: ago(1, 2, 50) },
      { id: "n36", s: dx2.id, a: "u-emma", c: "사용성 테스트: 5명만 테스트해도 문제의 85% 발견 가능 (닐슨)", t: ago(1, 2, 45) },
      { id: "n37", s: dx2.id, a: "u-minji", c: "디자인 시스템이란? 재사용 가능한 컴포넌트+가이드라인 모음", t: ago(1, 2, 40) },
      { id: "n38", s: dx2.id, a: "u-ryan", c: "Atomic Design 방법론: Atom → Molecule → Organism → Template → Page", t: ago(1, 2, 35) },

      // Econ Week 1
      { id: "n40", s: ec1.id, a: "u-alex", c: "GDP(국내총생산) = 소비 + 투자 + 정부지출 + 순수출", t: ago(5, 3, 50) },
      { id: "n41", s: ec1.id, a: "u-hyun", c: "한국 GDP ~1.7조 달러, 미국 GDP ~25조 달러 (2024 기준)", t: ago(5, 3, 45) },
      { id: "n42", s: ec1.id, a: "u-jason", c: "PPP(구매력평가) 기준으로 비교하면 격차가 줄어듦", t: ago(5, 3, 40) },
      { id: "n43", s: ec1.id, a: "u-dohyun", c: "인플레이션: 물가가 지속적으로 상승하는 현상. CPI로 측정", t: ago(5, 3, 35) },
      { id: "n44", s: ec1.id, a: "u-ryan", c: "중앙은행(한국은행, Fed) 기준금리로 물가 조절", t: ago(5, 3, 30) },
    ];

    for (const n of notes) {
      await prisma.liveNote.upsert({ where: { id: n.id }, update: {}, create: { id: n.id, sessionId: n.s, authorId: n.a, content: n.c, createdAt: n.t } });
    }

    // === SUMMARIES ===
    const summaries = [
      { id: "sum-cs1", s: cs1.id, a: "u-minji", gen: "ai", tags: ["Big-O", "시간복잡도", "공간복잡도"], content: JSON.stringify({ keyPoints: "• Big-O 표기법: 알고리즘 성능을 입력 크기에 대한 함수로 표현\n• 시간복잡도 순서: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n)\n• 상수 계수는 무시 (O(2n) = O(n))\n• 공간복잡도도 같은 방식으로 표현\n• 보통 최악의 경우(Worst Case)를 기준으로 분석", terms: ["Big-O", "시간복잡도", "공간복잡도", "Best/Worst/Average Case"], expectedQuestions: ["왜 Big-O에서 상수를 무시하나요?", "Best case와 Worst case 중 어떤 것이 더 중요한가요?", "O(n log n)과 O(n²)의 실제 실행 시간 차이는?"] }) },
      { id: "sum-cs2", s: cs2.id, a: "u-alex", gen: "ai", tags: ["정렬", "Sorting", "분할정복"], content: JSON.stringify({ keyPoints: "• Bubble Sort: O(n²), 단순하지만 느림\n• Merge Sort: O(n log n), 분할정복, 안정 정렬\n• Quick Sort: 평균 O(n log n), 최악 O(n²), 피벗 선택 중요\n• Counting Sort: O(n+k), 비교 기반 아님\n• 실무에서는 Timsort (하이브리드) 사용", terms: ["Bubble Sort", "Merge Sort", "Quick Sort", "Counting Sort", "Timsort", "안정 정렬"], expectedQuestions: ["Quick Sort의 피벗을 어떻게 선택하는 것이 최적인가요?", "안정 정렬이 왜 중요한가요?", "Timsort는 어떤 알고리즘들을 결합한 건가요?"] }) },
      { id: "sum-cs3", s: cs3.id, a: "u-emma", gen: "ai", tags: ["Stack", "Queue", "자료구조"], content: JSON.stringify({ keyPoints: "• Stack: LIFO, push/pop/peek - 괄호매칭, DFS에 활용\n• Queue: FIFO, enqueue/dequeue - BFS, 프린터큐에 활용\n• Priority Queue: 힙 기반, O(log n) 추출\n• Deque: 양방향 push/pop 가능", terms: ["Stack", "Queue", "LIFO", "FIFO", "Priority Queue", "Deque", "Heap"], expectedQuestions: ["Stack과 Queue를 언제 선택해야 하나요?", "Priority Queue는 어떻게 힙으로 구현하나요?"] }) },
      { id: "sum-dx1", s: dx1.id, a: "u-soyeon", gen: "ai", tags: ["UX", "페르소나", "Figma"], content: JSON.stringify({ keyPoints: "• UX 디자인 5단계: 공감→정의→아이디어→프로토타입→테스트\n• 사용자 페르소나는 구체적으로 작성\n• Figma 필수 단축키 숙지\n• 60-30-10 배색 법칙\n• WCAG 접근성 가이드라인 준수", terms: ["Design Thinking", "Persona", "Figma", "Color Theory", "WCAG"], expectedQuestions: ["좋은 페르소나의 조건은?", "접근성을 고려한 디자인이란?"] }) },
    ];

    for (const s of summaries) {
      await prisma.summary.upsert({ where: { id: s.id }, update: {}, create: { id: s.id, sessionId: s.s, authorId: s.a, generatedBy: s.gen, content: s.content, tags: JSON.stringify(s.tags) } });
    }

    // === QUESTIONS & ANSWERS (rich discussions) ===
    // Q1: Big-O 상수 무시 (solved, 3 answers)
    await prisma.question.upsert({ where: { id: "q1" }, update: {}, create: { id: "q1", courseId: cs101.id, sessionId: cs1.id, authorId: "u-alex", title: "Big-O에서 상수를 무시하는 이유가 뭔가요?", body: "O(2n)이나 O(3n)이나 다 O(n)이라고 하는데, 실제로 2배 3배 차이나는 거 아닌가요? 실무에서도 상수를 무시해도 되나요?", tags: JSON.stringify(["Big-O", "시간복잡도"]), status: "solved", acceptedAnswerId: "a1", createdAt: ago(9, 5) } });
    await prisma.answer.upsert({ where: { id: "a1" }, update: {}, create: { id: "a1", questionId: "q1", authorId: "u-minji", body: "Big-O는 '증가율'을 나타내는 거라 상수는 의미가 없어요. n이 100만이 되면 O(n)과 O(n²)의 차이가 상수 차이보다 압도적으로 커지거든요. 실무에서는 상수도 중요할 수 있지만, 알고리즘 설계 단계에서는 증가율이 핵심이에요!", isAccepted: true, createdAt: ago(9, 4) } });
    await prisma.answer.upsert({ where: { id: "a1b" }, update: {}, create: { id: "a1b", questionId: "q1", authorId: "u-emma", body: "추가로, 하드웨어 성능에 따라 상수 배수가 달라질 수 있어서 알고리즘 자체의 효율성을 비교할 때는 상수를 빼는 게 공정해요.", isAccepted: false, createdAt: ago(9, 3) } });
    await prisma.answer.upsert({ where: { id: "a1c" }, update: {}, create: { id: "a1c", questionId: "q1", authorId: "u-jason", body: "구글 면접에서도 Big-O 분석할 때 상수는 안 봐요. 다만 최적화 단계에서 캐시 히트율 같은 상수 요인이 중요해지긴 합니다.", isAccepted: false, createdAt: ago(9, 2) } });

    // Q2: Merge Sort vs Quick Sort (solved, 2 answers)
    await prisma.question.upsert({ where: { id: "q2" }, update: {}, create: { id: "q2", courseId: cs101.id, sessionId: cs2.id, authorId: "u-jiwoo", title: "Merge Sort와 Quick Sort 중 어떤 걸 써야 하나요?", body: "둘 다 O(n log n)인데 언제 어떤 걸 쓰는 게 좋은지 궁금합니다. 실무 기준으로 알려주세요!", tags: JSON.stringify(["정렬", "Merge Sort", "Quick Sort"]), status: "solved", acceptedAnswerId: "a2", createdAt: ago(6, 5) } });
    await prisma.answer.upsert({ where: { id: "a2" }, update: {}, create: { id: "a2", questionId: "q2", authorId: "u-alex", body: "Quick Sort가 평균적으로 더 빨라요 (상수가 작음). 하지만 최악의 경우 O(n²)가 될 수 있고, Merge Sort는 항상 O(n log n)이 보장됩니다. 안정성이 필요하면 Merge Sort, 메모리가 제한적이면 Quick Sort(in-place) 추천!", isAccepted: true, createdAt: ago(6, 4) } });
    await prisma.answer.upsert({ where: { id: "a2b" }, update: {}, create: { id: "a2b", questionId: "q2", authorId: "u-hyun", body: "파이썬의 sorted()는 Timsort로 Merge Sort + Insertion Sort 하이브리드예요. 대부분의 언어 기본 정렬이 이런 하이브리드 방식!", isAccepted: false, createdAt: ago(6, 3) } });

    // Q3: Stack으로 괄호 매칭 (open, 2 answers)
    await prisma.question.upsert({ where: { id: "q3" }, update: {}, create: { id: "q3", courseId: cs101.id, sessionId: cs3.id, authorId: "u-sophia", title: "Stack으로 괄호 매칭하는 코드 예시 있나요?", body: "개념은 이해했는데 실제 코드로 어떻게 구현하는지 감이 안 잡혀요. 파이썬이나 자바스크립트로 예시 부탁드려요!", tags: JSON.stringify(["Stack", "구현"]), status: "open", createdAt: ago(2, 8) } });
    await prisma.answer.upsert({ where: { id: "a3" }, update: {}, create: { id: "a3", questionId: "q3", authorId: "u-minji", body: "```python\ndef is_valid(s):\n    stack = []\n    pairs = {')':'(', ']':'[', '}':'{'}\n    for c in s:\n        if c in '([{':\n            stack.append(c)\n        elif c in ')]}':\n            if not stack or stack[-1] != pairs[c]:\n                return False\n            stack.pop()\n    return len(stack) == 0\n```\n여는 괄호는 push, 닫는 괄호를 만나면 top과 비교 후 pop!", isAccepted: false, createdAt: ago(2, 6) } });
    await prisma.answer.upsert({ where: { id: "a3b" }, update: {}, create: { id: "a3b", questionId: "q3", authorId: "u-jason", body: "LeetCode #20 'Valid Parentheses' 문제가 정확히 이 문제예요! 연습하기 좋습니다.", isAccepted: false, createdAt: ago(2, 5) } });

    // Q4: BST 삭제 연산 (open, 1 answer)
    await prisma.question.upsert({ where: { id: "q4" }, update: {}, create: { id: "q4", courseId: cs101.id, sessionId: cs4.id, authorId: "u-hyun", title: "BST에서 노드 삭제할 때 3가지 경우가 헷갈려요", body: "자식이 없는 경우, 1개인 경우, 2개인 경우 각각 어떻게 처리하는지 정리해주실 분?", tags: JSON.stringify(["BST", "트리", "삭제"]), status: "open", createdAt: ago(0, 5) } });
    await prisma.answer.upsert({ where: { id: "a4" }, update: {}, create: { id: "a4", questionId: "q4", authorId: "u-alex", body: "1) Leaf 노드: 그냥 삭제\n2) 자식 1개: 부모와 자식을 직접 연결\n3) 자식 2개: in-order successor(오른쪽 서브트리의 최소값)로 대체 후 해당 노드 삭제\n\n3번이 제일 까다로운데, 그림 그려가면서 이해하는 게 최고예요!", isAccepted: false, createdAt: ago(0, 3) } });

    // Q5: UX 포트폴리오 (open, 2 answers)
    await prisma.question.upsert({ where: { id: "q5" }, update: {}, create: { id: "q5", courseId: design.id, sessionId: dx1.id, authorId: "u-jiwoo", title: "UX 포트폴리오에 꼭 들어가야 할 요소가 뭔가요?", body: "취업 준비하면서 포트폴리오를 만들고 있는데, 어떤 프로젝트를 어떤 형식으로 넣어야 하는지 조언 부탁드립니다!", tags: JSON.stringify(["UX", "포트폴리오", "취업"]), status: "open", createdAt: ago(7, 10) } });
    await prisma.answer.upsert({ where: { id: "a5" }, update: {}, create: { id: "a5", questionId: "q5", authorId: "u-emma", body: "핵심은 '과정'을 보여주는 거예요!\n1. 문제 정의 (어떤 문제를 풀었는지)\n2. 리서치 (유저 인터뷰, 경쟁사 분석)\n3. 아이디어 도출 과정\n4. 와이어프레임 → 프로토타입 진행\n5. 사용성 테스트 결과\n6. Before/After 비교\n\n3~4개 프로젝트면 충분해요!", isAccepted: false, createdAt: ago(7, 8) } });
    await prisma.answer.upsert({ where: { id: "a5b" }, update: {}, create: { id: "a5b", questionId: "q5", authorId: "u-sophia", body: "개인적으로 Notion이나 개인 웹사이트가 좋아요. PDF보다 인터랙티브하게 보여줄 수 있으니까요. 그리고 실제 데이터와 메트릭이 있으면 +100점!", isAccepted: false, createdAt: ago(7, 6) } });

    // Q6: 한미 금리 차이 (solved)
    await prisma.question.upsert({ where: { id: "q6" }, update: {}, create: { id: "q6", courseId: econ.id, sessionId: ec1.id, authorId: "u-dohyun", title: "한미 금리 차이가 환율에 미치는 영향?", body: "미국 금리가 한국보다 높으면 달러가 강해지는 이유가 뭔가요?", tags: JSON.stringify(["금리", "환율", "거시경제"]), status: "solved", acceptedAnswerId: "a6", createdAt: ago(4, 6) } });
    await prisma.answer.upsert({ where: { id: "a6" }, update: {}, create: { id: "a6", questionId: "q6", authorId: "u-alex", body: "투자자들은 높은 수익률을 쫓아요. 미국 금리가 높으면 달러 자산이 매력적 → 달러 수요 증가 → 달러 강세 → 원화 약세. 이것을 '캐리 트레이드'라고 합니다. 한국은행이 미국 금리를 신경 쓸 수밖에 없는 이유!", isAccepted: true, createdAt: ago(4, 4) } });
    await prisma.answer.upsert({ where: { id: "a6b" }, update: {}, create: { id: "a6b", questionId: "q6", authorId: "u-hyun", body: "최근 한미 금리역전 현상이 있었죠. 원/달러 환율이 1400원 넘어갔던 것도 이 영향이 커요.", isAccepted: false, createdAt: ago(4, 3) } });

    // === REACTIONS ===
    const reactions = [
      { id: "r01", u: "u-alex", type: "note", target: "n01", emoji: "helpful" },
      { id: "r02", u: "u-emma", type: "note", target: "n01", emoji: "great" },
      { id: "r03", u: "u-jiwoo", type: "note", target: "n02", emoji: "fire" },
      { id: "r04", u: "u-minji", type: "note", target: "n07", emoji: "helpful" },
      { id: "r05", u: "u-sophia", type: "note", target: "n09", emoji: "insightful" },
      { id: "r06", u: "u-hyun", type: "answer", target: "a1", emoji: "great" },
      { id: "r07", u: "u-sophia", type: "answer", target: "a1", emoji: "helpful" },
      { id: "r08", u: "u-jason", type: "answer", target: "a1", emoji: "fire" },
      { id: "r09", u: "u-minji", type: "answer", target: "a2", emoji: "great" },
      { id: "r10", u: "u-jiwoo", type: "answer", target: "a2", emoji: "helpful" },
      { id: "r11", u: "u-alex", type: "answer", target: "a3", emoji: "fire" },
      { id: "r12", u: "u-sophia", type: "answer", target: "a3", emoji: "helpful" },
      { id: "r13", u: "u-emma", type: "answer", target: "a6", emoji: "insightful" },
      { id: "r14", u: "u-dohyun", type: "answer", target: "a6", emoji: "great" },
      { id: "r15", u: "u-alex", type: "summary", target: "sum-cs1", emoji: "helpful" },
      { id: "r16", u: "u-jiwoo", type: "summary", target: "sum-cs2", emoji: "great" },
      { id: "r17", u: "u-hyun", type: "note", target: "n24", emoji: "fire" },
      { id: "r18", u: "u-minji", type: "note", target: "n27", emoji: "helpful" },
    ];

    for (const r of reactions) {
      await prisma.reaction.upsert({ where: { id: r.id }, update: {}, create: { id: r.id, userId: r.u, targetType: r.type, targetId: r.target, emoji: r.emoji } });
    }

    // === EVENT LOGS (activity history) ===
    const events = [
      { u: "u-minji", e: "note_created", m: { courseTitle: "CS101" }, t: ago(10, 1, 50) },
      { u: "u-alex", e: "note_created", m: { courseTitle: "CS101" }, t: ago(10, 1, 45) },
      { u: "u-minji", e: "summary_generated", m: { courseTitle: "CS101", week: "Week 1" }, t: ago(9, 8) },
      { u: "u-alex", e: "question_created", m: { title: "Big-O에서 상수를 무시하는 이유가 뭔가요?" }, t: ago(9, 5) },
      { u: "u-minji", e: "answer_created", m: { questionTitle: "Big-O에서 상수를 무시하는 이유가 뭔가요?" }, t: ago(9, 4) },
      { u: "u-alex", e: "answer_accepted", m: { answerer: "민지", questionTitle: "Big-O에서 상수를 무시하는 이유가 뭔가요?" }, t: ago(9, 3) },
      { u: "u-jiwoo", e: "note_created", m: { courseTitle: "CS101" }, t: ago(7, 1, 35) },
      { u: "u-alex", e: "summary_generated", m: { courseTitle: "CS101", week: "Week 2" }, t: ago(6, 8) },
      { u: "u-jiwoo", e: "question_created", m: { title: "Merge Sort와 Quick Sort 중 어떤 걸 써야 하나요?" }, t: ago(6, 5) },
      { u: "u-alex", e: "answer_created", m: { questionTitle: "Merge Sort와 Quick Sort 중 어떤 걸 써야 하나요?" }, t: ago(6, 4) },
      { u: "u-emma", e: "note_created", m: { courseTitle: "UX/UI 디자인 워크숍" }, t: ago(8, 2, 50) },
      { u: "u-emma", e: "answer_created", m: { questionTitle: "UX 포트폴리오에 꼭 들어가야 할 요소가 뭔가요?" }, t: ago(7, 8) },
      { u: "u-sophia", e: "question_created", m: { title: "Stack으로 괄호 매칭하는 코드 예시 있나요?" }, t: ago(2, 8) },
      { u: "u-minji", e: "answer_created", m: { questionTitle: "Stack으로 괄호 매칭하는 코드 예시 있나요?" }, t: ago(2, 6) },
      { u: "u-alex", e: "note_created", m: { courseTitle: "글로벌 경제학 입문" }, t: ago(5, 3, 50) },
      { u: "u-dohyun", e: "question_created", m: { title: "한미 금리 차이가 환율에 미치는 영향?" }, t: ago(4, 6) },
      { u: "u-alex", e: "answer_accepted", m: { answerer: "Alex", questionTitle: "한미 금리 차이가 환율에 미치는 영향?" }, t: ago(4, 3) },
      { u: "u-alex", e: "note_created", m: { courseTitle: "CS101" }, t: ago(0, 0, 25) },
      { u: "u-minji", e: "note_created", m: { courseTitle: "CS101" }, t: ago(0, 0, 20) },
      { u: "u-hyun", e: "question_created", m: { title: "BST에서 노드 삭제할 때 3가지 경우가 헷갈려요" }, t: ago(0, 5) },
      { u: "u-alex", e: "streak_reached", m: { days: 7 }, t: ago(0, 1) },
      { u: "u-minji", e: "badge_earned", m: { badge: "활발한 학습자", threshold: 50 }, t: ago(2) },
      { u: "u-alex", e: "badge_earned", m: { badge: "활발한 학습자", threshold: 50 }, t: ago(3) },
      { u: "u-alex", e: "level_up", m: { level: 4 }, t: ago(1) },
    ];

    for (const ev of events) {
      await prisma.eventLog.create({ data: { userId: ev.u, event: ev.e, metadata: JSON.stringify(ev.m), createdAt: ev.t } });
    }

    return NextResponse.json({ ok: true, message: "Seed completed: 12 users, 3 courses, 44 notes, 4 summaries, 6 questions, 11 answers, 18 reactions, 24 events" });
  } catch (e) {
    console.error("Seed error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

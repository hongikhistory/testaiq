import "dotenv/config";
import bcrypt from "bcryptjs";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("../src/generated/prisma/client");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // ── Schools ──
  const hongik = await prisma.school.upsert({
    where: { id: "school-hongik" },
    update: {},
    create: { id: "school-hongik", name: "홍익대학교", countryCode: "KR" },
  });

  const ucb = await prisma.school.upsert({
    where: { id: "school-ucb" },
    update: {},
    create: { id: "school-ucb", name: "UC Berkeley", countryCode: "US" },
  });

  // ── Group ──
  const group = await prisma.group.upsert({
    where: { id: "group-pilot" },
    update: {},
    create: {
      id: "group-pilot",
      name: "CampUs 파일럿 그룹",
      schoolAId: hongik.id,
      schoolBId: ucb.id,
      inviteCode: "CAMPUS2026",
    },
  });

  const password = await bcrypt.hash("password123", 10);
  const now = new Date();
  const DAY = 86400000;

  // ── Users (Hongik) ──
  const minji = await prisma.user.upsert({
    where: { email: "minji@hongik.ac.kr" },
    update: {},
    create: {
      email: "minji@hongik.ac.kr", password, nickname: "민지", avatar: "🌸",
      schoolId: hongik.id, groupId: group.id, points: 87, level: 4, streak: 5,
      lastActiveAt: new Date(now.getTime() - 30 * 60000),
      onboarded: true, termsAgreed: true,
    },
  });

  const jihoon = await prisma.user.upsert({
    where: { email: "jihoon@hongik.ac.kr" },
    update: {},
    create: {
      email: "jihoon@hongik.ac.kr", password, nickname: "지훈", avatar: "🔥",
      schoolId: hongik.id, groupId: group.id, points: 52, level: 3, streak: 3,
      lastActiveAt: new Date(now.getTime() - 2 * 3600000),
      onboarded: true, termsAgreed: true,
    },
  });

  const soyeon = await prisma.user.upsert({
    where: { email: "soyeon@hongik.ac.kr" },
    update: {},
    create: {
      email: "soyeon@hongik.ac.kr", password, nickname: "소연", avatar: "✨",
      schoolId: hongik.id, groupId: group.id, points: 34, level: 2, streak: 7,
      lastActiveAt: new Date(now.getTime() - 45 * 60000),
      onboarded: true, termsAgreed: true,
    },
  });

  const hyunwoo = await prisma.user.upsert({
    where: { email: "hyunwoo@hongik.ac.kr" },
    update: {},
    create: {
      email: "hyunwoo@hongik.ac.kr", password, nickname: "현우", avatar: "💻",
      schoolId: hongik.id, groupId: group.id, points: 21, level: 2, streak: 1,
      lastActiveAt: new Date(now.getTime() - 5 * 3600000),
      onboarded: true, termsAgreed: true,
    },
  });

  // ── Users (UC Berkeley) ──
  const alex = await prisma.user.upsert({
    where: { email: "alex@berkeley.edu" },
    update: {},
    create: {
      email: "alex@berkeley.edu", password, nickname: "Alex", avatar: "🎯",
      schoolId: ucb.id, groupId: group.id, points: 63, level: 3, streak: 4,
      lastActiveAt: new Date(now.getTime() - 1 * 3600000),
      onboarded: true, termsAgreed: true,
    },
  });

  const emma = await prisma.user.upsert({
    where: { email: "emma@berkeley.edu" },
    update: {},
    create: {
      email: "emma@berkeley.edu", password, nickname: "Emma", avatar: "🦋",
      schoolId: ucb.id, groupId: group.id, points: 45, level: 2, streak: 2,
      lastActiveAt: new Date(now.getTime() - 3 * 3600000),
      onboarded: true, termsAgreed: true,
    },
  });

  const ryan = await prisma.user.upsert({
    where: { email: "ryan@berkeley.edu" },
    update: {},
    create: {
      email: "ryan@berkeley.edu", password, nickname: "Ryan", avatar: "🚀",
      schoolId: ucb.id, groupId: group.id, points: 28, level: 2, streak: 0,
      lastActiveAt: new Date(now.getTime() - 8 * 3600000),
      onboarded: true, termsAgreed: true,
    },
  });

  const sophia = await prisma.user.upsert({
    where: { email: "sophia@berkeley.edu" },
    update: {},
    create: {
      email: "sophia@berkeley.edu", password, nickname: "Sophia", avatar: "🌟",
      schoolId: ucb.id, groupId: group.id, points: 15, level: 1, streak: 1,
      lastActiveAt: new Date(now.getTime() - 12 * 3600000),
      onboarded: true, termsAgreed: true,
    },
  });

  // ── Admin ──
  await prisma.user.upsert({
    where: { email: "admin@campus.com" },
    update: {},
    create: {
      email: "admin@campus.com", password, nickname: "운영자", avatar: "🛡️",
      schoolId: hongik.id, groupId: group.id, role: "admin", points: 0,
      onboarded: true, termsAgreed: true,
    },
  });

  const allUsers = [minji, jihoon, soyeon, hyunwoo, alex, emma, ryan, sophia];

  // ── Course 1: CS101 ──
  const cs101 = await prisma.course.upsert({
    where: { id: "course-cs101" },
    update: {},
    create: {
      id: "course-cs101", groupId: group.id, title: "컴퓨터과학 개론 (CS101)",
      description: "컴퓨터과학의 기초를 배우는 공동 수업. 알고리즘, 자료구조, 운영체제 등 핵심 개념을 다룹니다.",
      tags: JSON.stringify(["CS", "알고리즘", "자료구조"]),
      timezone: "Asia/Seoul",
      scheduleJson: JSON.stringify([
        { dayOfWeek: 1, startTime: "10:00", endTime: "11:30" },
        { dayOfWeek: 3, startTime: "10:00", endTime: "11:30" },
      ]),
      inviteCode: "CS101JOIN", createdBy: minji.id,
    },
  });

  // ── Course 2: Design Thinking ──
  const design = await prisma.course.upsert({
    where: { id: "course-design" },
    update: {},
    create: {
      id: "course-design", groupId: group.id, title: "디자인씽킹 워크숍",
      description: "사용자 중심의 문제 해결 방법론을 배우고 실제 프로젝트에 적용합니다.",
      tags: JSON.stringify(["UX", "디자인", "프로토타입"]),
      timezone: "Asia/Seoul",
      scheduleJson: JSON.stringify([
        { dayOfWeek: 2, startTime: "14:00", endTime: "15:30" },
      ]),
      inviteCode: "DESIGN26", createdBy: alex.id,
    },
  });

  // ── Course 3: Data Science ──
  const dataSci = await prisma.course.upsert({
    where: { id: "course-datasci" },
    update: {},
    create: {
      id: "course-datasci", groupId: group.id, title: "Data Science Fundamentals",
      description: "Introduction to data analysis, visualization, and machine learning basics.",
      tags: JSON.stringify(["Python", "ML", "데이터분석"]),
      timezone: "Asia/Seoul",
      scheduleJson: JSON.stringify([
        { dayOfWeek: 4, startTime: "13:00", endTime: "14:30" },
      ]),
      inviteCode: "DATA2026", createdBy: emma.id,
    },
  });

  // ── Course Members ──
  const courseMemberPairs = [
    // CS101 - all users
    ...allUsers.map(u => ({ courseId: cs101.id, userId: u.id })),
    // Design - subset
    { courseId: design.id, userId: minji.id },
    { courseId: design.id, userId: alex.id },
    { courseId: design.id, userId: soyeon.id },
    { courseId: design.id, userId: emma.id },
    { courseId: design.id, userId: ryan.id },
    // Data Science - subset
    { courseId: dataSci.id, userId: alex.id },
    { courseId: dataSci.id, userId: emma.id },
    { courseId: dataSci.id, userId: jihoon.id },
    { courseId: dataSci.id, userId: sophia.id },
    { courseId: dataSci.id, userId: hyunwoo.id },
  ];

  for (const pair of courseMemberPairs) {
    await prisma.courseMember.upsert({
      where: { courseId_userId: { courseId: pair.courseId, userId: pair.userId } },
      update: {},
      create: { courseId: pair.courseId, userId: pair.userId },
    });
  }

  // ── CS101 Sessions ──
  const cs101Past1 = await prisma.session.upsert({
    where: { id: "cs101-past1" }, update: {},
    create: {
      id: "cs101-past1", courseId: cs101.id,
      startsAt: new Date(now.getTime() - 7 * DAY + 10 * 3600000),
      endsAt: new Date(now.getTime() - 7 * DAY + 11.5 * 3600000),
      weekLabel: "Week 1 - 알고리즘 기초",
    },
  });

  const cs101Past2 = await prisma.session.upsert({
    where: { id: "cs101-past2" }, update: {},
    create: {
      id: "cs101-past2", courseId: cs101.id,
      startsAt: new Date(now.getTime() - 5 * DAY + 10 * 3600000),
      endsAt: new Date(now.getTime() - 5 * DAY + 11.5 * 3600000),
      weekLabel: "Week 1 - 자료구조 입문",
    },
  });

  const cs101Past3 = await prisma.session.upsert({
    where: { id: "cs101-past3" }, update: {},
    create: {
      id: "cs101-past3", courseId: cs101.id,
      startsAt: new Date(now.getTime() - 3 * DAY + 10 * 3600000),
      endsAt: new Date(now.getTime() - 3 * DAY + 11.5 * 3600000),
      weekLabel: "Week 2 - 정렬 알고리즘",
    },
  });

  const cs101Current = await prisma.session.upsert({
    where: { id: "cs101-current" }, update: {},
    create: {
      id: "cs101-current", courseId: cs101.id,
      startsAt: new Date(now.getTime() - 30 * 60000),
      endsAt: new Date(now.getTime() + 60 * 60000),
      weekLabel: "Week 2 - 탐색 알고리즘",
    },
  });

  const cs101Future = await prisma.session.upsert({
    where: { id: "cs101-future" }, update: {},
    create: {
      id: "cs101-future", courseId: cs101.id,
      startsAt: new Date(now.getTime() + 2 * DAY + 10 * 3600000),
      endsAt: new Date(now.getTime() + 2 * DAY + 11.5 * 3600000),
      weekLabel: "Week 3 - 그래프",
    },
  });

  // ── Design Sessions ──
  const designPast1 = await prisma.session.upsert({
    where: { id: "design-past1" }, update: {},
    create: {
      id: "design-past1", courseId: design.id,
      startsAt: new Date(now.getTime() - 6 * DAY + 14 * 3600000),
      endsAt: new Date(now.getTime() - 6 * DAY + 15.5 * 3600000),
      weekLabel: "Week 1 - 공감 단계",
    },
  });

  const designPast2 = await prisma.session.upsert({
    where: { id: "design-past2" }, update: {},
    create: {
      id: "design-past2", courseId: design.id,
      startsAt: new Date(now.getTime() - 1 * DAY + 14 * 3600000),
      endsAt: new Date(now.getTime() - 1 * DAY + 15.5 * 3600000),
      weekLabel: "Week 2 - 문제 정의",
    },
  });

  await prisma.session.upsert({
    where: { id: "design-future" }, update: {},
    create: {
      id: "design-future", courseId: design.id,
      startsAt: new Date(now.getTime() + 1 * DAY + 14 * 3600000),
      endsAt: new Date(now.getTime() + 1 * DAY + 15.5 * 3600000),
      weekLabel: "Week 3 - 아이디어 발산",
    },
  });

  // ── Data Science Sessions ──
  const dsciPast1 = await prisma.session.upsert({
    where: { id: "dsci-past1" }, update: {},
    create: {
      id: "dsci-past1", courseId: dataSci.id,
      startsAt: new Date(now.getTime() - 4 * DAY + 13 * 3600000),
      endsAt: new Date(now.getTime() - 4 * DAY + 14.5 * 3600000),
      weekLabel: "Week 1 - Pandas & NumPy",
    },
  });

  await prisma.session.upsert({
    where: { id: "dsci-future" }, update: {},
    create: {
      id: "dsci-future", courseId: dataSci.id,
      startsAt: new Date(now.getTime() + 3 * DAY + 13 * 3600000),
      endsAt: new Date(now.getTime() + 3 * DAY + 14.5 * 3600000),
      weekLabel: "Week 2 - Matplotlib & Seaborn",
    },
  });

  // ── CS101 Week 1 - Live Notes ──
  const cs101Notes1 = [
    { id: "note-c1s1-1", sessionId: cs101Past1.id, authorId: minji.id, content: "오늘 수업에서 배운 핵심: Big-O 표기법의 개념과 시간복잡도 분석 방법. 알고리즘을 비교할 때 가장 중요한 도구!", tags: JSON.stringify(["Big-O", "시간복잡도"]) },
    { id: "note-c1s1-2", sessionId: cs101Past1.id, authorId: alex.id, content: "Key takeaway: O(n log n) is the best comparison-based sorting complexity. Professor showed proof using decision trees.", tags: JSON.stringify(["sorting", "complexity"]) },
    { id: "note-c1s1-3", sessionId: cs101Past1.id, authorId: jihoon.id, content: "시간복잡도 비교: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n). 실무에서는 보통 O(n log n) 이하를 목표로 해야 한다고 함.", tags: JSON.stringify(["시간복잡도", "알고리즘"]) },
    { id: "note-c1s1-4", sessionId: cs101Past1.id, authorId: soyeon.id, content: "교수님이 강조한 포인트: 빅오 분석할 때 최선/평균/최악의 경우를 구분해야 함. 보통 최악의 경우(worst case)를 기준으로 분석.", tags: JSON.stringify(["Big-O"]) },
    { id: "note-c1s1-5", sessionId: cs101Past1.id, authorId: emma.id, content: "Interesting comparison: Array access is O(1) but searching is O(n). Hash tables give us O(1) average for both operations!", tags: JSON.stringify(["자료구조", "해시테이블"]) },
    { id: "note-c1s1-6", sessionId: cs101Past1.id, authorId: ryan.id, content: "Space complexity is often overlooked but equally important. Merge sort uses O(n) extra space while quicksort uses O(log n).", tags: JSON.stringify(["공간복잡도", "정렬"]) },
  ];

  // ── CS101 Week 1 Day 2 - Live Notes ──
  const cs101Notes2 = [
    { id: "note-c1s2-1", sessionId: cs101Past2.id, authorId: minji.id, content: "자료구조 입문! 배열, 연결리스트, 스택, 큐의 차이점 정리. 각각의 시간복잡도가 다르니 상황에 맞게 선택해야 함.", tags: JSON.stringify(["자료구조", "배열", "연결리스트"]) },
    { id: "note-c1s2-2", sessionId: cs101Past2.id, authorId: jihoon.id, content: "스택: LIFO(Last In First Out) - 함수 호출, Undo 기능에 사용\n큐: FIFO(First In First Out) - 프린터 대기열, BFS에 사용", tags: JSON.stringify(["스택", "큐"]) },
    { id: "note-c1s2-3", sessionId: cs101Past2.id, authorId: alex.id, content: "Linked list vs Array: linked lists are O(1) for insertion/deletion at head, but O(n) for random access. Arrays are the opposite.", tags: JSON.stringify(["연결리스트", "배열"]) },
    { id: "note-c1s2-4", sessionId: cs101Past2.id, authorId: emma.id, content: "Tree structures: Binary trees allow O(log n) search if balanced. AVL and Red-Black trees maintain balance automatically.", tags: JSON.stringify(["트리", "BST"]) },
    { id: "note-c1s2-5", sessionId: cs101Past2.id, authorId: hyunwoo.id, content: "해시 테이블은 평균 O(1)이지만 충돌이 많으면 O(n)까지 악화될 수 있음. 좋은 해시 함수가 중요!", tags: JSON.stringify(["해시테이블"]) },
  ];

  // ── CS101 Week 2 - Live Notes ──
  const cs101Notes3 = [
    { id: "note-c1s3-1", sessionId: cs101Past3.id, authorId: minji.id, content: "정렬 알고리즘 비교 정리!\n- Bubble Sort: O(n²), 교육용\n- Selection Sort: O(n²), 간단\n- Merge Sort: O(n log n), 안정적\n- Quick Sort: O(n log n) 평균, 실무에서 가장 많이 사용", tags: JSON.stringify(["정렬", "알고리즘"]) },
    { id: "note-c1s3-2", sessionId: cs101Past3.id, authorId: alex.id, content: "Quicksort pivot selection strategies:\n1. First element (bad for sorted input)\n2. Random element (good average)\n3. Median-of-three (best practical choice)", tags: JSON.stringify(["퀵소트", "정렬"]) },
    { id: "note-c1s3-3", sessionId: cs101Past3.id, authorId: soyeon.id, content: "머지소트는 divide & conquer의 대표 예시. 배열을 반으로 나누고, 정렬 후 합치는 과정. 항상 O(n log n)을 보장하는 게 장점!", tags: JSON.stringify(["머지소트", "분할정복"]) },
    { id: "note-c1s3-4", sessionId: cs101Past3.id, authorId: jihoon.id, content: "실습에서 직접 구현해본 결과: 10만 개 데이터에서 Bubble Sort 12초 vs Quick Sort 0.02초. 차이가 엄청남", tags: JSON.stringify(["정렬", "성능"]) },
    { id: "note-c1s3-5", sessionId: cs101Past3.id, authorId: sophia.id, content: "Counting sort and Radix sort can achieve O(n) but only work for integers within a known range. Not comparison-based!", tags: JSON.stringify(["카운팅정렬", "기수정렬"]) },
    { id: "note-c1s3-6", sessionId: cs101Past3.id, authorId: ryan.id, content: "Stability in sorting: Merge sort is stable (equal elements maintain order), quicksort is not. Important when sorting by multiple keys.", tags: JSON.stringify(["안정정렬"]) },
    { id: "note-c1s3-7", sessionId: cs101Past3.id, authorId: hyunwoo.id, content: "재귀적으로 생각하는 게 처음엔 어렵지만 연습하면 자연스러워진다고 함. 머지소트 코드를 직접 짜보는 게 좋은 연습!", tags: JSON.stringify(["재귀", "연습"]) },
  ];

  // ── Current session (live) notes ──
  const cs101NotesLive = [
    { id: "note-c1s4-1", sessionId: cs101Current.id, authorId: minji.id, content: "이진 탐색(Binary Search) 시작! 정렬된 배열에서 O(log n)으로 원소를 찾을 수 있음. 매번 탐색 범위를 절반으로 줄이는 원리.", tags: JSON.stringify(["이진탐색", "탐색"]) },
    { id: "note-c1s4-2", sessionId: cs101Current.id, authorId: alex.id, content: "Binary search only works on sorted arrays! Common interview mistake: forgetting to check if input is sorted first.", tags: JSON.stringify(["이진탐색", "면접"]) },
    { id: "note-c1s4-3", sessionId: cs101Current.id, authorId: soyeon.id, content: "DFS vs BFS 설명 시작됨. 깊이 우선 탐색은 스택(재귀), 너비 우선 탐색은 큐를 사용. 각각 장단점이 있음.", tags: JSON.stringify(["DFS", "BFS", "그래프"]) },
  ];

  // ── Design - Live Notes ──
  const designNotes1 = [
    { id: "note-d1s1-1", sessionId: designPast1.id, authorId: alex.id, content: "Design Thinking 5 stages: Empathize, Define, Ideate, Prototype, Test. Today focused on Empathize - understanding users deeply.", tags: JSON.stringify(["디자인씽킹", "공감"]) },
    { id: "note-d1s1-2", sessionId: designPast1.id, authorId: soyeon.id, content: "사용자 인터뷰 기법: 열린 질문 사용, 왜?를 5번 물어보기(5 Whys), 관찰 노트 작성. 실제 인터뷰 실습이 정말 도움됐어요!", tags: JSON.stringify(["사용자인터뷰", "UX"]) },
    { id: "note-d1s1-3", sessionId: designPast1.id, authorId: minji.id, content: "공감 맵(Empathy Map) 그리는 법 배움. Says/Thinks/Does/Feels 네 가지로 사용자를 분석하는 프레임워크.", tags: JSON.stringify(["공감맵", "프레임워크"]) },
    { id: "note-d1s1-4", sessionId: designPast1.id, authorId: emma.id, content: "Key insight: Users often say one thing but do another. Observation is more reliable than interviews alone.", tags: JSON.stringify(["UX리서치"]) },
  ];

  const designNotes2 = [
    { id: "note-d1s2-1", sessionId: designPast2.id, authorId: minji.id, content: "문제 정의 단계: 'How Might We...' 질문법으로 문제를 기회로 재프레이밍하기. 너무 넓지도 좁지도 않은 범위가 핵심!", tags: JSON.stringify(["문제정의", "HMW"]) },
    { id: "note-d1s2-2", sessionId: designPast2.id, authorId: alex.id, content: "Affinity diagram exercise: We grouped 50+ sticky notes into 6 themes. Visual clustering really helps find patterns.", tags: JSON.stringify(["어피니티다이어그램"]) },
    { id: "note-d1s2-3", sessionId: designPast2.id, authorId: ryan.id, content: "Point of View (POV) statement format: [User] needs [need] because [insight]. This keeps us focused on the real problem.", tags: JSON.stringify(["POV", "사용자니즈"]) },
  ];

  // ── Data Science - Live Notes ──
  const dsciNotes1 = [
    { id: "note-ds1-1", sessionId: dsciPast1.id, authorId: emma.id, content: "Pandas DataFrame basics: pd.read_csv(), df.head(), df.describe(), df.info(). These 4 commands cover 80% of initial data exploration.", tags: JSON.stringify(["Pandas", "Python"]) },
    { id: "note-ds1-2", sessionId: dsciPast1.id, authorId: jihoon.id, content: "NumPy 배열 연산이 Python 리스트보다 100배 이상 빠른 이유: vectorized operations + C로 구현된 내부 코드", tags: JSON.stringify(["NumPy", "성능"]) },
    { id: "note-ds1-3", sessionId: dsciPast1.id, authorId: alex.id, content: "Data cleaning checklist:\n1. Check for nulls: df.isnull().sum()\n2. Check duplicates: df.duplicated()\n3. Check data types: df.dtypes\n4. Check outliers: df.describe()", tags: JSON.stringify(["데이터정제", "Pandas"]) },
    { id: "note-ds1-4", sessionId: dsciPast1.id, authorId: sophia.id, content: "Learned about .groupby() and .agg() for aggregation. Super useful for analyzing data by categories!", tags: JSON.stringify(["Pandas", "집계"]) },
    { id: "note-ds1-5", sessionId: dsciPast1.id, authorId: hyunwoo.id, content: "merge vs join vs concat 차이점 정리: merge는 SQL-like, join은 인덱스 기반, concat은 단순 결합. 상황에 따라 골라 쓰기.", tags: JSON.stringify(["Pandas", "데이터결합"]) },
  ];

  // Create all notes
  const allNoteData = [
    ...cs101Notes1, ...cs101Notes2, ...cs101Notes3, ...cs101NotesLive,
    ...designNotes1, ...designNotes2, ...dsciNotes1,
  ];

  for (const note of allNoteData) {
    await prisma.liveNote.upsert({
      where: { id: note.id }, update: {},
      create: note,
    });
  }

  // ── Summaries ──
  await prisma.summary.upsert({
    where: { id: "summary-cs101-w1d1" }, update: {},
    create: {
      id: "summary-cs101-w1d1", sessionId: cs101Past1.id, authorId: minji.id,
      content: JSON.stringify({
        keyPoints: "• Big-O 표기법: 알고리즘의 성능을 나타내는 표기법으로 입력 크기에 따른 실행 시간의 증가율을 표현\n• 시간복잡도 순서: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2^n)\n• 공간복잡도: 알고리즘이 사용하는 추가 메모리 양\n• 최선/평균/최악의 경우를 구분하여 분석하며, 보통 최악의 경우를 기준으로 함\n• 해시 테이블은 평균 O(1) 접근이 가능한 강력한 자료구조",
        terms: ["Big-O", "시간복잡도", "공간복잡도", "해시테이블", "최악의 경우"],
        expectedQuestions: ["Big-O에서 상수를 무시하는 이유는?", "O(n log n)이 비교 기반 정렬의 하한인 이유는?", "해시 충돌이 발생하면 시간복잡도는 어떻게 되나요?"],
      }),
      tags: JSON.stringify(["Big-O", "시간복잡도", "정렬"]),
      generatedBy: "ai",
    },
  });

  await prisma.summary.upsert({
    where: { id: "summary-cs101-w1d2" }, update: {},
    create: {
      id: "summary-cs101-w1d2", sessionId: cs101Past2.id, authorId: jihoon.id,
      content: JSON.stringify({
        keyPoints: "• 배열: 연속 메모리, O(1) 접근, O(n) 삽입/삭제\n• 연결리스트: 비연속 메모리, O(n) 접근, O(1) 헤드 삽입\n• 스택(LIFO): 함수 호출, Undo, 괄호 매칭에 활용\n• 큐(FIFO): BFS, 작업 스케줄링, 프린터 대기열에 활용\n• 이진 탐색 트리: 균형 상태에서 O(log n) 검색 가능",
        terms: ["배열", "연결리스트", "스택", "큐", "이진탐색트리", "AVL트리"],
        expectedQuestions: ["배열과 연결리스트를 언제 각각 사용해야 할까?", "스택으로 구현할 수 있는 알고리즘은?", "AVL 트리의 회전 연산은 어떻게 동작하나요?"],
      }),
      tags: JSON.stringify(["자료구조", "스택", "큐", "트리"]),
      generatedBy: "ai",
    },
  });

  await prisma.summary.upsert({
    where: { id: "summary-cs101-w2" }, update: {},
    create: {
      id: "summary-cs101-w2", sessionId: cs101Past3.id, authorId: soyeon.id,
      content: JSON.stringify({
        keyPoints: "• Bubble/Selection Sort: O(n²), 교육 목적에 적합\n• Merge Sort: O(n log n) 보장, 안정 정렬, 추가 메모리 O(n)\n• Quick Sort: 평균 O(n log n), 불안정, 실무에서 가장 많이 사용\n• Counting/Radix Sort: O(n) 가능하나 정수 범위 제한 있음\n• 피봇 선택 전략이 Quick Sort 성능에 크게 영향\n• 10만 개 데이터 실습: Bubble 12초 vs Quick 0.02초",
        terms: ["버블정렬", "머지소트", "퀵소트", "카운팅정렬", "안정정렬", "분할정복"],
        expectedQuestions: ["Quick Sort의 최악의 경우는 언제 발생하나요?", "안정 정렬이 왜 중요한가요?", "실무에서는 어떤 정렬 알고리즘을 사용하나요?"],
      }),
      tags: JSON.stringify(["정렬", "알고리즘", "분할정복"]),
      generatedBy: "ai",
    },
  });

  await prisma.summary.upsert({
    where: { id: "summary-design-w1" }, update: {},
    create: {
      id: "summary-design-w1", sessionId: designPast1.id, authorId: alex.id,
      content: JSON.stringify({
        keyPoints: "• Design Thinking 5단계: Empathize, Define, Ideate, Prototype, Test\n• 공감 단계에서는 사용자를 깊이 이해하는 것이 목표\n• 사용자 인터뷰: 열린 질문, 5 Whys 기법 활용\n• 공감 맵: Says/Thinks/Does/Feels 네 축으로 사용자 분석\n• 관찰(Observation)이 인터뷰보다 더 신뢰도 높은 데이터 제공",
        terms: ["디자인씽킹", "공감", "사용자인터뷰", "공감맵", "5 Whys"],
        expectedQuestions: ["공감 맵과 페르소나의 차이는?", "인터뷰에서 편향을 줄이는 방법은?", "관찰 리서치를 효과적으로 하려면?"],
      }),
      tags: JSON.stringify(["디자인씽킹", "UX", "공감"]),
      generatedBy: "ai",
    },
  });

  await prisma.summary.upsert({
    where: { id: "summary-dsci-w1" }, update: {},
    create: {
      id: "summary-dsci-w1", sessionId: dsciPast1.id, authorId: emma.id,
      content: JSON.stringify({
        keyPoints: "• Pandas 핵심 4개 명령어: read_csv, head, describe, info\n• NumPy가 Python 리스트보다 100배 빠른 이유: vectorization + C backend\n• 데이터 정제 체크리스트: null 확인, 중복 제거, 타입 확인, 이상치 확인\n• groupby + agg로 카테고리별 집계 분석 가능\n• merge/join/concat의 차이와 적절한 사용 시점",
        terms: ["Pandas", "NumPy", "DataFrame", "데이터정제", "groupby", "merge"],
        expectedQuestions: ["대용량 데이터에서 Pandas 성능을 최적화하는 방법은?", "결측치 처리 전략에는 어떤 것들이 있나요?", "merge와 join의 성능 차이는?"],
      }),
      tags: JSON.stringify(["Python", "Pandas", "데이터분석"]),
      generatedBy: "ai",
    },
  });

  // ── Questions ──
  const q1 = await prisma.question.upsert({
    where: { id: "question-1" }, update: {},
    create: {
      id: "question-1", courseId: cs101.id, sessionId: cs101Past1.id, authorId: alex.id,
      title: "Big-O에서 상수를 무시하는 이유가 뭔가요?",
      body: "O(2n)을 O(n)으로 표기한다고 했는데, 실제로 2배 차이가 나는데 왜 무시하나요? 실무에서도 상수를 무시해도 되나요?",
      tags: JSON.stringify(["Big-O", "시간복잡도"]),
      status: "solved", acceptedAnswerId: "answer-1",
    },
  });

  const q2 = await prisma.question.upsert({
    where: { id: "question-2" }, update: {},
    create: {
      id: "question-2", courseId: cs101.id, sessionId: cs101Past3.id, authorId: minji.id,
      title: "Merge Sort vs Quick Sort 어떤 게 더 좋나요?",
      body: "둘 다 O(n log n)인데 실제로는 어떤 차이가 있나요? 교수님은 Quick Sort가 실무에서 더 많이 쓰인다고 했는데 왜인가요?",
      tags: JSON.stringify(["정렬", "알고리즘"]),
      status: "solved", acceptedAnswerId: "answer-3",
    },
  });

  const q3 = await prisma.question.upsert({
    where: { id: "question-3" }, update: {},
    create: {
      id: "question-3", courseId: cs101.id, sessionId: cs101Past2.id, authorId: soyeon.id,
      title: "연결리스트를 실무에서 사용하는 경우가 있나요?",
      body: "배열이 더 빠르고 편한데 연결리스트를 왜 배우는 건지 궁금합니다. 실제 프로젝트에서 써본 분 있나요?",
      tags: JSON.stringify(["자료구조", "연결리스트"]),
      status: "solved", acceptedAnswerId: "answer-5",
    },
  });

  const q4 = await prisma.question.upsert({
    where: { id: "question-4" }, update: {},
    create: {
      id: "question-4", courseId: cs101.id, sessionId: cs101Past3.id, authorId: emma.id,
      title: "Quick Sort의 worst case를 피하려면 어떻게 해야 하나요?",
      body: "Pivot을 잘못 선택하면 O(n²)이 된다고 했는데, 실제로 이런 일이 자주 발생하나요? 방지하는 방법이 있나요?",
      tags: JSON.stringify(["퀵소트", "알고리즘"]),
      status: "open",
    },
  });

  const q5 = await prisma.question.upsert({
    where: { id: "question-5" }, update: {},
    create: {
      id: "question-5", courseId: cs101.id, sessionId: cs101Past1.id, authorId: hyunwoo.id,
      title: "해시 테이블의 충돌 해결 방법 정리",
      body: "수업에서 잠깐 언급된 체이닝과 오픈 어드레싱의 차이가 헷갈립니다. 어떤 게 더 좋은 건가요?",
      tags: JSON.stringify(["해시테이블", "자료구조"]),
      status: "open",
    },
  });

  const q6 = await prisma.question.upsert({
    where: { id: "question-6" }, update: {},
    create: {
      id: "question-6", courseId: design.id, sessionId: designPast1.id, authorId: soyeon.id,
      title: "사용자 인터뷰할 때 유도 질문을 피하려면?",
      body: "인터뷰 실습을 해봤는데 자꾸 제 의견이 질문에 담기게 돼요. 중립적인 질문을 하려면 어떻게 해야 하나요?",
      tags: JSON.stringify(["사용자인터뷰", "UX리서치"]),
      status: "solved", acceptedAnswerId: "answer-8",
    },
  });

  const q7 = await prisma.question.upsert({
    where: { id: "question-7" }, update: {},
    create: {
      id: "question-7", courseId: design.id, sessionId: designPast2.id, authorId: ryan.id,
      title: "How Might We 질문이 너무 넓으면 어떻게 좁히나요?",
      body: "HMW 질문이 '어떻게 하면 사용자를 도울 수 있을까?'처럼 너무 넓어지는데 적절한 범위는 어떻게 잡나요?",
      tags: JSON.stringify(["HMW", "문제정의"]),
      status: "open",
    },
  });

  const q8 = await prisma.question.upsert({
    where: { id: "question-8" }, update: {},
    create: {
      id: "question-8", courseId: dataSci.id, sessionId: dsciPast1.id, authorId: jihoon.id,
      title: "Pandas에서 대용량 CSV 파일 처리 팁?",
      body: "2GB짜리 CSV를 read_csv로 로드하면 메모리가 부족합니다. 어떻게 처리해야 하나요?",
      tags: JSON.stringify(["Pandas", "대용량데이터"]),
      status: "solved", acceptedAnswerId: "answer-10",
    },
  });

  const q9 = await prisma.question.upsert({
    where: { id: "question-9" }, update: {},
    create: {
      id: "question-9", courseId: dataSci.id, sessionId: dsciPast1.id, authorId: sophia.id,
      title: "결측치 처리: 삭제 vs 대체 언제 어떤 걸?",
      body: "NaN 값을 dropna()로 지우는 것과 fillna()로 채우는 것 중 어떤 게 나은지 기준이 궁금합니다.",
      tags: JSON.stringify(["데이터정제", "결측치"]),
      status: "open",
    },
  });

  // ── Answers ──
  await prisma.answer.upsert({
    where: { id: "answer-1" }, update: {},
    create: {
      id: "answer-1", questionId: q1.id, authorId: minji.id,
      body: "Big-O는 입력 크기가 매우 클 때의 증가율을 보는 거라서 상수보다 패턴이 중요해요. n이 100만이 되면 O(2n)이든 O(n)이든 비슷하지만 O(n²)은 완전히 다른 수준이 됩니다. 실무에서는 상수가 중요할 때도 있지만, 알고리즘 선택의 첫 번째 기준은 Big-O입니다.",
      isAccepted: true,
    },
  });

  await prisma.answer.upsert({
    where: { id: "answer-2" }, update: {},
    create: {
      id: "answer-2", questionId: q1.id, authorId: jihoon.id,
      body: "추가로 말씀드리면, 실무에서 캐시 지역성(cache locality) 같은 상수 요인이 중요한 경우도 있어요. 그래서 이론적으로 느린 알고리즘이 실제로 더 빠른 경우도 있습니다.",
      isAccepted: false,
    },
  });

  await prisma.answer.upsert({
    where: { id: "answer-3" }, update: {},
    create: {
      id: "answer-3", questionId: q2.id, authorId: alex.id,
      body: "Quick Sort가 실무에서 더 많이 쓰이는 이유:\n1. In-place 정렬이라 추가 메모리가 거의 필요 없음 (O(log n) vs Merge Sort의 O(n))\n2. 캐시 효율이 좋음 (연속 메모리 접근)\n3. 상수 계수가 작아서 실제 속도가 빠름\n\n다만 Merge Sort는 안정 정렬이라 Java의 Arrays.sort()는 객체 배열에 TimSort(Merge Sort 변형)를 사용해요.",
      isAccepted: true,
    },
  });

  await prisma.answer.upsert({
    where: { id: "answer-4" }, update: {},
    create: {
      id: "answer-4", questionId: q2.id, authorId: emma.id,
      body: "Python의 sorted()도 TimSort를 사용합니다. 대부분의 언어 표준 라이브러리는 상황에 따라 다른 정렬을 혼합해서 사용해요.",
      isAccepted: false,
    },
  });

  await prisma.answer.upsert({
    where: { id: "answer-5" }, update: {},
    create: {
      id: "answer-5", questionId: q3.id, authorId: alex.id,
      body: "실무에서 연결리스트 사용 사례:\n1. LRU Cache 구현 (해시맵 + 이중 연결리스트)\n2. 운영체제의 메모리 관리\n3. 블록체인의 블록 연결\n4. React의 Fiber architecture\n\n직접 구현하기보다는 개념을 이해하는 게 중요해요. 많은 시스템 내부에서 사용됩니다.",
      isAccepted: true,
    },
  });

  await prisma.answer.upsert({
    where: { id: "answer-6" }, update: {},
    create: {
      id: "answer-6", questionId: q4.id, authorId: jihoon.id,
      body: "Worst case 방지 방법:\n1. Randomized pivot: 랜덤하게 선택하면 O(n²)이 될 확률이 거의 0\n2. Median-of-three: 첫, 중간, 마지막 값 중 중앙값 선택\n3. Intro Sort: Quick Sort하다가 재귀 깊이가 깊어지면 Heap Sort로 전환\n\nC++의 std::sort()가 Intro Sort를 사용합니다.",
      isAccepted: false,
    },
  });

  await prisma.answer.upsert({
    where: { id: "answer-7" }, update: {},
    create: {
      id: "answer-7", questionId: q5.id, authorId: soyeon.id,
      body: "체이닝은 같은 인덱스에 연결리스트를 만드는 것이고, 오픈 어드레싱은 빈 슬롯을 찾아 이동하는 거예요. 체이닝이 구현이 간단하고 삭제도 쉽지만, 오픈 어드레싱이 캐시 효율이 좋아요.",
      isAccepted: false,
    },
  });

  await prisma.answer.upsert({
    where: { id: "answer-8" }, update: {},
    create: {
      id: "answer-8", questionId: q6.id, authorId: alex.id,
      body: "중립적인 질문 팁:\n- '이것은 좋은가요?' 대신 '이것에 대해 어떻게 느끼시나요?' 사용\n- '왜 안 하셨나요?' 대신 '그때 어떤 생각이 드셨나요?'\n- 자신의 가설을 먼저 말하지 않기\n- 침묵을 견디기 (사용자가 스스로 더 말하게 됨)\n- 5초 규칙: 질문 후 최소 5초 기다리기",
      isAccepted: true,
    },
  });

  await prisma.answer.upsert({
    where: { id: "answer-9" }, update: {},
    create: {
      id: "answer-9", questionId: q7.id, authorId: minji.id,
      body: "HMW를 좁히는 방법: 구체적인 사용자, 상황, 제약 조건을 추가하세요.\n예시: '어떻게 하면 사용자를 도울 수 있을까?' -> '어떻게 하면 바쁜 직장인이 점심시간에 건강한 식사를 쉽게 할 수 있을까?'",
      isAccepted: false,
    },
  });

  await prisma.answer.upsert({
    where: { id: "answer-10" }, update: {},
    create: {
      id: "answer-10", questionId: q8.id, authorId: emma.id,
      body: "대용량 CSV 처리 방법:\n1. chunksize 파라미터: pd.read_csv('file.csv', chunksize=10000)\n2. 필요한 컬럼만 로드: usecols=['col1', 'col2']\n3. 데이터 타입 지정: dtype={'col1': 'int32'}\n4. Dask 라이브러리 사용 (lazy evaluation)\n5. Parquet 포맷으로 변환 (압축 + 빠른 읽기)",
      isAccepted: true,
    },
  });

  await prisma.answer.upsert({
    where: { id: "answer-11" }, update: {},
    create: {
      id: "answer-11", questionId: q9.id, authorId: alex.id,
      body: "기준은 결측 비율과 결측 패턴입니다:\n- 결측 비율이 5% 미만: fillna(mean/median) 으로 대체\n- 5~30%: 다중 대체법(Multiple Imputation) 고려\n- 30% 이상: 해당 컬럼 삭제 고려\n- MCAR(완전 무작위 결측)이면 삭제해도 편향 없음\n- MAR/MNAR이면 대체가 더 적절",
      isAccepted: false,
    },
  });

  // ── Reactions ──
  const reactionData = [
    // CS101 Week 1 notes
    { id: "rxn-1", userId: alex.id, targetType: "note", targetId: "note-c1s1-1", emoji: "helpful" },
    { id: "rxn-2", userId: jihoon.id, targetType: "note", targetId: "note-c1s1-1", emoji: "helpful" },
    { id: "rxn-3", userId: emma.id, targetType: "note", targetId: "note-c1s1-1", emoji: "great" },
    { id: "rxn-4", userId: minji.id, targetType: "note", targetId: "note-c1s1-2", emoji: "insightful" },
    { id: "rxn-5", userId: soyeon.id, targetType: "note", targetId: "note-c1s1-2", emoji: "helpful" },
    { id: "rxn-6", userId: alex.id, targetType: "note", targetId: "note-c1s1-3", emoji: "great" },
    { id: "rxn-7", userId: minji.id, targetType: "note", targetId: "note-c1s1-3", emoji: "helpful" },
    { id: "rxn-8", userId: jihoon.id, targetType: "note", targetId: "note-c1s1-5", emoji: "insightful" },
    { id: "rxn-9", userId: ryan.id, targetType: "note", targetId: "note-c1s1-5", emoji: "fire" },
    // CS101 Week 2 notes
    { id: "rxn-10", userId: alex.id, targetType: "note", targetId: "note-c1s3-1", emoji: "great" },
    { id: "rxn-11", userId: emma.id, targetType: "note", targetId: "note-c1s3-1", emoji: "helpful" },
    { id: "rxn-12", userId: jihoon.id, targetType: "note", targetId: "note-c1s3-1", emoji: "fire" },
    { id: "rxn-13", userId: soyeon.id, targetType: "note", targetId: "note-c1s3-1", emoji: "helpful" },
    { id: "rxn-14", userId: minji.id, targetType: "note", targetId: "note-c1s3-2", emoji: "insightful" },
    { id: "rxn-15", userId: soyeon.id, targetType: "note", targetId: "note-c1s3-2", emoji: "helpful" },
    { id: "rxn-16", userId: alex.id, targetType: "note", targetId: "note-c1s3-4", emoji: "fire" },
    { id: "rxn-17", userId: minji.id, targetType: "note", targetId: "note-c1s3-4", emoji: "great" },
    { id: "rxn-18", userId: emma.id, targetType: "note", targetId: "note-c1s3-4", emoji: "great" },
    // Design notes
    { id: "rxn-19", userId: minji.id, targetType: "note", targetId: "note-d1s1-1", emoji: "helpful" },
    { id: "rxn-20", userId: soyeon.id, targetType: "note", targetId: "note-d1s1-1", emoji: "insightful" },
    { id: "rxn-21", userId: alex.id, targetType: "note", targetId: "note-d1s1-2", emoji: "great" },
    { id: "rxn-22", userId: emma.id, targetType: "note", targetId: "note-d1s1-3", emoji: "helpful" },
    // Data Science notes
    { id: "rxn-23", userId: jihoon.id, targetType: "note", targetId: "note-ds1-1", emoji: "helpful" },
    { id: "rxn-24", userId: alex.id, targetType: "note", targetId: "note-ds1-1", emoji: "helpful" },
    { id: "rxn-25", userId: sophia.id, targetType: "note", targetId: "note-ds1-2", emoji: "insightful" },
    { id: "rxn-26", userId: emma.id, targetType: "note", targetId: "note-ds1-3", emoji: "great" },
    { id: "rxn-27", userId: hyunwoo.id, targetType: "note", targetId: "note-ds1-3", emoji: "fire" },
    // Answer reactions
    { id: "rxn-28", userId: alex.id, targetType: "answer", targetId: "answer-1", emoji: "helpful" },
    { id: "rxn-29", userId: emma.id, targetType: "answer", targetId: "answer-1", emoji: "insightful" },
    { id: "rxn-30", userId: minji.id, targetType: "answer", targetId: "answer-3", emoji: "great" },
    { id: "rxn-31", userId: soyeon.id, targetType: "answer", targetId: "answer-3", emoji: "helpful" },
    { id: "rxn-32", userId: minji.id, targetType: "answer", targetId: "answer-5", emoji: "insightful" },
    { id: "rxn-33", userId: jihoon.id, targetType: "answer", targetId: "answer-8", emoji: "helpful" },
    { id: "rxn-34", userId: soyeon.id, targetType: "answer", targetId: "answer-10", emoji: "great" },
    { id: "rxn-35", userId: jihoon.id, targetType: "answer", targetId: "answer-10", emoji: "helpful" },
    // Live current session notes
    { id: "rxn-36", userId: alex.id, targetType: "note", targetId: "note-c1s4-1", emoji: "helpful" },
    { id: "rxn-37", userId: soyeon.id, targetType: "note", targetId: "note-c1s4-1", emoji: "great" },
    { id: "rxn-38", userId: minji.id, targetType: "note", targetId: "note-c1s4-2", emoji: "insightful" },
  ];

  for (const rxn of reactionData) {
    await prisma.reaction.upsert({
      where: { id: rxn.id }, update: {},
      create: rxn,
    });
  }

  // ── Event Logs (Activity Feed) ──
  const eventData = [
    // Recent activity - newest first
    { id: "evt-1", userId: minji.id, event: "note_created", metadata: JSON.stringify({ courseTitle: "컴퓨터과학 개론", sessionLabel: "Week 2 - 탐색 알고리즘" }), createdAt: new Date(now.getTime() - 15 * 60000) },
    { id: "evt-2", userId: alex.id, event: "note_created", metadata: JSON.stringify({ courseTitle: "컴퓨터과학 개론", sessionLabel: "Week 2 - 탐색 알고리즘" }), createdAt: new Date(now.getTime() - 12 * 60000) },
    { id: "evt-3", userId: soyeon.id, event: "note_created", metadata: JSON.stringify({ courseTitle: "컴퓨터과학 개론", sessionLabel: "Week 2 - 탐색 알고리즘" }), createdAt: new Date(now.getTime() - 8 * 60000) },
    { id: "evt-4", userId: emma.id, event: "answer_created", metadata: JSON.stringify({ title: "Quick Sort의 worst case를 피하려면..." }), createdAt: new Date(now.getTime() - 2 * 3600000) },
    { id: "evt-5", userId: jihoon.id, event: "answer_created", metadata: JSON.stringify({ title: "Quick Sort의 worst case를 피하려면..." }), createdAt: new Date(now.getTime() - 3 * 3600000) },
    { id: "evt-6", userId: soyeon.id, event: "summary_generated", metadata: JSON.stringify({ courseTitle: "컴퓨터과학 개론", sessionLabel: "Week 2 - 정렬 알고리즘" }), createdAt: new Date(now.getTime() - 4 * 3600000) },
    { id: "evt-7", userId: emma.id, event: "question_created", metadata: JSON.stringify({ title: "Quick Sort의 worst case를 피하려면 어떻게 해야 하나요?" }), createdAt: new Date(now.getTime() - 5 * 3600000) },
    { id: "evt-8", userId: minji.id, event: "answer_accepted", metadata: JSON.stringify({ title: "Merge Sort vs Quick Sort 어떤 게 더 좋나요?" }), createdAt: new Date(now.getTime() - 6 * 3600000) },
    { id: "evt-9", userId: alex.id, event: "answer_created", metadata: JSON.stringify({ title: "Merge Sort vs Quick Sort 어떤 게 더 좋나요?" }), createdAt: new Date(now.getTime() - 7 * 3600000) },
    { id: "evt-10", userId: ryan.id, event: "note_created", metadata: JSON.stringify({ courseTitle: "컴퓨터과학 개론", sessionLabel: "Week 2 - 정렬 알고리즘" }), createdAt: new Date(now.getTime() - 8 * 3600000) },
    { id: "evt-11", userId: soyeon.id, event: "note_created", metadata: JSON.stringify({ courseTitle: "컴퓨터과학 개론", sessionLabel: "Week 2 - 정렬 알고리즘" }), createdAt: new Date(now.getTime() - 9 * 3600000) },
    { id: "evt-12", userId: minji.id, event: "streak_reached", metadata: JSON.stringify({ days: 5 }), createdAt: new Date(now.getTime() - 10 * 3600000) },
    { id: "evt-13", userId: jihoon.id, event: "badge_earned", metadata: JSON.stringify({ badge: "기여자 ⭐" }), createdAt: new Date(now.getTime() - 12 * 3600000) },
    { id: "evt-14", userId: alex.id, event: "level_up", metadata: JSON.stringify({ level: 3 }), createdAt: new Date(now.getTime() - 14 * 3600000) },
    { id: "evt-15", userId: emma.id, event: "summary_generated", metadata: JSON.stringify({ courseTitle: "Data Science Fundamentals", sessionLabel: "Week 1 - Pandas & NumPy" }), createdAt: new Date(now.getTime() - 16 * 3600000) },
    { id: "evt-16", userId: emma.id, event: "answer_created", metadata: JSON.stringify({ title: "Pandas에서 대용량 CSV 파일 처리 팁?" }), createdAt: new Date(now.getTime() - 18 * 3600000) },
    { id: "evt-17", userId: alex.id, event: "answer_created", metadata: JSON.stringify({ title: "사용자 인터뷰할 때 유도 질문을 피하려면?" }), createdAt: new Date(now.getTime() - 20 * 3600000) },
    { id: "evt-18", userId: jihoon.id, event: "note_created", metadata: JSON.stringify({ courseTitle: "Data Science Fundamentals", sessionLabel: "Week 1 - Pandas & NumPy" }), createdAt: new Date(now.getTime() - 22 * 3600000) },
    { id: "evt-19", userId: soyeon.id, event: "question_created", metadata: JSON.stringify({ title: "사용자 인터뷰할 때 유도 질문을 피하려면?" }), createdAt: new Date(now.getTime() - 24 * 3600000) },
    { id: "evt-20", userId: minji.id, event: "summary_generated", metadata: JSON.stringify({ courseTitle: "컴퓨터과학 개론", sessionLabel: "Week 1 - 알고리즘 기초" }), createdAt: new Date(now.getTime() - 2 * DAY) },
    { id: "evt-21", userId: minji.id, event: "badge_earned", metadata: JSON.stringify({ badge: "열심히 배우는 중 📖" }), createdAt: new Date(now.getTime() - 2.5 * DAY) },
    { id: "evt-22", userId: alex.id, event: "note_created", metadata: JSON.stringify({ courseTitle: "디자인씽킹 워크숍", sessionLabel: "Week 1 - 공감 단계" }), createdAt: new Date(now.getTime() - 3 * DAY) },
    { id: "evt-23", userId: hyunwoo.id, event: "question_created", metadata: JSON.stringify({ title: "해시 테이블의 충돌 해결 방법 정리" }), createdAt: new Date(now.getTime() - 3.5 * DAY) },
    { id: "evt-24", userId: sophia.id, event: "note_created", metadata: JSON.stringify({ courseTitle: "Data Science Fundamentals", sessionLabel: "Week 1 - Pandas & NumPy" }), createdAt: new Date(now.getTime() - 4 * DAY) },
    { id: "evt-25", userId: ryan.id, event: "badge_earned", metadata: JSON.stringify({ badge: "첫 걸음 👣" }), createdAt: new Date(now.getTime() - 5 * DAY) },
  ];

  for (const evt of eventData) {
    await prisma.eventLog.upsert({
      where: { id: evt.id }, update: {},
      create: evt,
    });
  }

  console.log("Seed completed!");
  console.log("───────────────────────────────────────────");
  console.log("Demo accounts (password: password123):");
  console.log("  Hongik: minji@hongik.ac.kr | jihoon@hongik.ac.kr | soyeon@hongik.ac.kr | hyunwoo@hongik.ac.kr");
  console.log("  UCB:    alex@berkeley.edu  | emma@berkeley.edu   | ryan@berkeley.edu   | sophia@berkeley.edu");
  console.log("  Admin:  admin@campus.com");
  console.log("───────────────────────────────────────────");
  console.log("Groups: CAMPUS2026");
  console.log("Courses: CS101JOIN | DESIGN26 | DATA2026");
  console.log(`Data: ${allNoteData.length} notes, 5 summaries, 9 questions, 11 answers, ${reactionData.length} reactions, ${eventData.length} events`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

import "dotenv/config";
import bcrypt from "bcryptjs";

// Use @prisma/client directly for seed (handles config automatically)
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
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

  const minji = await prisma.user.upsert({
    where: { email: "minji@hongik.ac.kr" },
    update: {},
    create: {
      email: "minji@hongik.ac.kr", password, nickname: "민지",
      schoolId: hongik.id, groupId: group.id, points: 25, onboarded: true, termsAgreed: true,
    },
  });

  const alex = await prisma.user.upsert({
    where: { email: "alex@berkeley.edu" },
    update: {},
    create: {
      email: "alex@berkeley.edu", password, nickname: "Alex",
      schoolId: ucb.id, groupId: group.id, points: 18, onboarded: true, termsAgreed: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@campus.com" },
    update: {},
    create: {
      email: "admin@campus.com", password, nickname: "운영자",
      schoolId: hongik.id, groupId: group.id, role: "admin", points: 0, onboarded: true, termsAgreed: true,
    },
  });

  const course = await prisma.course.upsert({
    where: { id: "course-cs101" },
    update: {},
    create: {
      id: "course-cs101", groupId: group.id, title: "컴퓨터과학 개론 (CS101)",
      description: "컴퓨터과학의 기초를 배우는 공동 수업",
      tags: JSON.stringify(["CS", "알고리즘", "자료구조"]),
      timezone: "Asia/Seoul",
      scheduleJson: JSON.stringify([{ dayOfWeek: 1, startTime: "10:00", endTime: "11:30" }, { dayOfWeek: 3, startTime: "10:00", endTime: "11:30" }]),
      inviteCode: "CS101JOIN", createdBy: minji.id,
    },
  });

  await prisma.courseMember.upsert({
    where: { courseId_userId: { courseId: course.id, userId: minji.id } },
    update: {}, create: { courseId: course.id, userId: minji.id },
  });
  await prisma.courseMember.upsert({
    where: { courseId_userId: { courseId: course.id, userId: alex.id } },
    update: {}, create: { courseId: course.id, userId: alex.id },
  });

  const now = new Date();

  const pastSession = await prisma.session.upsert({
    where: { id: "session-past" }, update: {},
    create: {
      id: "session-past", courseId: course.id,
      startsAt: new Date(now.getTime() - 3 * 86400000 + 36000000),
      endsAt: new Date(now.getTime() - 3 * 86400000 + 41400000),
      weekLabel: "Week 1",
    },
  });

  await prisma.session.upsert({
    where: { id: "session-current" }, update: {},
    create: {
      id: "session-current", courseId: course.id,
      startsAt: new Date(now.getTime() - 1800000),
      endsAt: new Date(now.getTime() + 3600000),
      weekLabel: "Week 2",
    },
  });

  await prisma.session.upsert({
    where: { id: "session-future" }, update: {},
    create: {
      id: "session-future", courseId: course.id,
      startsAt: new Date(now.getTime() + 4 * 86400000 + 36000000),
      endsAt: new Date(now.getTime() + 4 * 86400000 + 41400000),
      weekLabel: "Week 3",
    },
  });

  await prisma.liveNote.upsert({
    where: { id: "note-1" }, update: {},
    create: {
      id: "note-1", sessionId: pastSession.id, authorId: minji.id,
      content: "오늘 수업에서 배운 핵심: Big-O 표기법의 개념과 시간복잡도 분석 방법",
      tags: JSON.stringify(["Big-O", "시간복잡도"]),
    },
  });
  await prisma.liveNote.upsert({
    where: { id: "note-2" }, update: {},
    create: {
      id: "note-2", sessionId: pastSession.id, authorId: alex.id,
      content: "Key takeaway: O(n log n) is the best comparison-based sorting complexity",
      tags: JSON.stringify(["sorting", "complexity"]),
    },
  });

  await prisma.summary.upsert({
    where: { id: "summary-1" }, update: {},
    create: {
      id: "summary-1", sessionId: pastSession.id, authorId: minji.id,
      content: JSON.stringify({
        keyPoints: "• Big-O 표기법: 알고리즘의 성능을 나타내는 표기법\n• 시간복잡도: O(1) < O(log n) < O(n) < O(n log n) < O(n²)\n• 공간복잡도: 알고리즘이 사용하는 메모리 양",
        terms: ["Big-O", "시간복잡도", "공간복잡도", "정렬", "분석"],
        expectedQuestions: ["Big-O에서 상수는 왜 무시?", "O(n log n)이 최적인 이유?", "실무에서 시간복잡도 측정법?"],
      }),
      tags: JSON.stringify(["Big-O", "시간복잡도", "정렬"]),
      generatedBy: "ai",
    },
  });

  const q1 = await prisma.question.upsert({
    where: { id: "question-1" }, update: {},
    create: {
      id: "question-1", courseId: course.id, sessionId: pastSession.id, authorId: alex.id,
      title: "Big-O에서 상수를 무시하는 이유가 뭔가요?",
      body: "O(2n)을 O(n)으로 표기한다고 했는데, 실제로 2배 차이가 나는데 왜 무시하나요?",
      tags: JSON.stringify(["Big-O", "시간복잡도"]),
      status: "solved", acceptedAnswerId: "answer-1",
    },
  });

  await prisma.answer.upsert({
    where: { id: "answer-1" }, update: {},
    create: {
      id: "answer-1", questionId: q1.id, authorId: minji.id,
      body: "Big-O는 입력 크기가 매우 클 때의 증가율을 보는 거라서 상수보다 패턴이 중요해요.",
      isAccepted: true,
    },
  });

  await prisma.question.upsert({
    where: { id: "question-2" }, update: {},
    create: {
      id: "question-2", courseId: course.id, sessionId: pastSession.id, authorId: minji.id,
      title: "Merge Sort vs Quick Sort 어떤 게 더 좋나요?",
      body: "둘 다 O(n log n)인데 실제로는 어떤 차이가 있나요?",
      tags: JSON.stringify(["정렬", "알고리즘"]),
      status: "open",
    },
  });

  console.log("Seed completed!");
  console.log("Demo: minji@hongik.ac.kr / alex@berkeley.edu / admin@campus.com (pw: password123)");
  console.log("Group: CAMPUS2026 | Course: CS101JOIN");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

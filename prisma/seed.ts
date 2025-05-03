import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../server/auth-helpers';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding database...');

  // Create demo users
  const hashedPassword = await hashPassword('password123');
  
  const alice = await prisma.user.upsert({
    where: { username: 'alice' },
    update: {},
    create: {
      username: 'alice',
      password: hashedPassword,
      name: 'Alice Johnson',
      headline: 'Software Engineer | React | Node.js | TypeScript',
      bio: 'Passionate about building user-friendly web applications and solving complex problems.',
      profilePicture: 'https://randomuser.me/api/portraits/women/12.jpg'
    },
  });

  const bob = await prisma.user.upsert({
    where: { username: 'bob' },
    update: {},
    create: {
      username: 'bob',
      password: hashedPassword,
      name: 'Bob Smith',
      headline: 'Product Manager | UX Design | Growth Strategy',
      bio: 'Helping teams build products that customers love.',
      profilePicture: 'https://randomuser.me/api/portraits/men/45.jpg'
    },
  });

  const charlie = await prisma.user.upsert({
    where: { username: 'charlie' },
    update: {},
    create: {
      username: 'charlie',
      password: hashedPassword,
      name: 'Charlie Davis',
      headline: 'Data Scientist | Machine Learning | Python',
      bio: 'Turning data into actionable insights.',
      profilePicture: 'https://randomuser.me/api/portraits/women/22.jpg'
    },
  });

  // Create connections between users
  await prisma.connection.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: alice.id,
      connectedUserId: bob.id,
      status: 'accepted',
    },
  });

  await prisma.connection.upsert({
    where: { id: 2 },
    update: {},
    create: {
      userId: bob.id,
      connectedUserId: alice.id,
      status: 'accepted',
    },
  });

  await prisma.connection.upsert({
    where: { id: 3 },
    update: {},
    create: {
      userId: charlie.id,
      connectedUserId: alice.id,
      status: 'pending',
    },
  });

  // Create sample posts
  const post1 = await prisma.post.upsert({
    where: { id: 1 },
    update: {},
    create: {
      content: 'Just completed a new project using React and TypeScript. Really enjoying the type safety!',
      userId: alice.id,
    },
  });

  const post2 = await prisma.post.upsert({
    where: { id: 2 },
    update: {},
    create: {
      content: 'Excited to announce that our team has launched a new product feature today!',
      userId: bob.id,
    },
  });

  // Create comments
  await prisma.comment.upsert({
    where: { id: 1 },
    update: {},
    create: {
      content: 'Looks great! Would love to hear more about your project.',
      postId: post1.id,
      userId: bob.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: 2 },
    update: {},
    create: {
      content: 'Congratulations on the launch!',
      postId: post2.id,
      userId: alice.id,
    },
  });

  // Create post likes
  await prisma.postLike.upsert({
    where: { id: 1 },
    update: {},
    create: {
      postId: post1.id,
      userId: bob.id,
    },
  });

  await prisma.postLike.upsert({
    where: { id: 2 },
    update: {},
    create: {
      postId: post2.id,
      userId: alice.id,
    },
  });

  // Create experiences
  await prisma.experience.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Software Engineer',
      company: 'Tech Solutions Inc.',
      location: 'San Francisco, CA',
      startDate: "2020-01-01", 
      // current: true,
      description: 'Developing web applications using React, Node.js, and TypeScript.',
      userId: alice.id,
    },
  });

  await prisma.experience.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: 'Product Manager',
      company: 'InnovateTech',
      location: 'Seattle, WA',
      startDate: "2020-01-01", 
      // current: true,
      description: 'Leading product development for a SaaS platform.',
      userId: bob.id,
    },
  });

  // Create education
  await prisma.education.upsert({
    where: { id: 1 },
    update: {},
    create: {
      school: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: "2020-01-01",
      endDate: "2020-01-01",
      description: 'Focused on software engineering and algorithms.',
      userId: alice.id,
    },
  });

  await prisma.education.upsert({
    where: { id: 2 },
    update: {},
    create: {
      school: 'Stanford University',
      degree: 'MBA',
      fieldOfStudy: 'Business Administration',
      startDate: "2020-01-01", 
      endDate: "2020-01-01", 
      description: 'Specialized in product management and entrepreneurship.',
      userId: bob.id,
    },
  });

  // Create messages
  await prisma.message.upsert({
    where: { id: 1 },
    update: {},
    create: {
      content: 'Hi Bob, how are you doing?',
      senderId: alice.id,
      receiverId: bob.id,
      isRead: true,
    },
  });

  await prisma.message.upsert({
    where: { id: 2 },
    update: {},
    create: {
      content: 'Hey Alice! I\'m doing well, thanks for asking. How about you?',
      senderId: bob.id,
      receiverId: alice.id,
      isRead: false,
    },
  });

  // Create notifications
  await prisma.notification.upsert({
    where: { id: 1 },
    update: {},
    create: {
      userId: alice.id,
      actorId: bob.id,
      type: 'like',
      content: 'Bob Smith liked your post',
      entityId: post1.id,
      entityType: 'post',
    },
  });

  await prisma.notification.upsert({
    where: { id: 2 },
    update: {},
    create: {
      userId: bob.id,
      actorId: alice.id,
      type: 'comment',
      content: 'Alice Johnson commented on your post',
      entityId: post2.id,
      entityType: 'post',
    },
  });

  console.log('Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
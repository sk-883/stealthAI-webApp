import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.postLike.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.experience.deleteMany({});
  await prisma.education.deleteMany({});
  await prisma.connection.deleteMany({});
  await prisma.user.deleteMany({});

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const alexJohnson = await prisma.user.create({
    data: {
      username: 'alexjohnson',
      password: hashedPassword,
      name: 'Alex Johnson',
      headline: 'Senior Software Engineer at Tech Innovations',
      bio: 'Passionate about building scalable applications and solving complex problems.',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg'
    }
  });

  const sarahLee = await prisma.user.create({
    data: {
      username: 'sarahlee',
      password: hashedPassword,
      name: 'Sarah Lee',
      headline: 'Product Manager at Creative Solutions',
      bio: 'Helping teams build products that customers love.',
      profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg'
    }
  });

  const michaelChen = await prisma.user.create({
    data: {
      username: 'michaelchen',
      password: hashedPassword,
      name: 'Michael Chen',
      headline: 'Data Scientist at DataMinds',
      bio: 'Leveraging data to drive business decisions.',
      profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg'
    }
  });

  const emiliaRodriguez = await prisma.user.create({
    data: {
      username: 'emiliarodriguez',
      password: hashedPassword,
      name: 'Emilia Rodriguez',
      headline: 'UX Designer at DesignForward',
      bio: 'Creating intuitive and beautiful user experiences.',
      profilePicture: 'https://randomuser.me/api/portraits/women/4.jpg'
    }
  });

  // Create posts
  const alexPost1 = await prisma.post.create({
    data: {
      userId: alexJohnson.id,
      content: "Just launched a new feature at work that improves load times by 40%! #webperf #engineering",
      likes: 15,
      comments: 3,
      shares: 2,
    }
  });

  const sarahPost1 = await prisma.post.create({
    data: {
      userId: sarahLee.id,
      content: "Excited to announce that our product has reached 10,000 users! Thanks to our amazing team for their hard work.",
      likes: 42,
      comments: 7,
      shares: 5,
    }
  });

  const michaelPost1 = await prisma.post.create({
    data: {
      userId: michaelChen.id,
      content: "Just finished a new data analysis project using Python and TensorFlow. The insights we discovered are going to revolutionize our approach!",
      likes: 28,
      comments: 4,
      shares: 3,
    }
  });

  const emiliaPost1 = await prisma.post.create({
    data: {
      userId: emiliaRodriguez.id,
      content: "Just finished a new design project. Check out these wireframes for our upcoming mobile app!",
      imageUrl: "https://placehold.co/600x400/png",
      likes: 36,
      comments: 9,
      shares: 4,
    }
  });

  // Create comments
  await prisma.comment.create({
    data: {
      postId: alexPost1.id,
      userId: sarahLee.id,
      content: "That's amazing! What techniques did you use to achieve that optimization?"
    }
  });

  await prisma.comment.create({
    data: {
      postId: alexPost1.id,
      userId: michaelChen.id,
      content: "Great work! Would love to learn more about your approach."
    }
  });

  await prisma.comment.create({
    data: {
      postId: sarahPost1.id,
      userId: alexJohnson.id,
      content: "Congratulations! What a milestone!"
    }
  });

  // Create connections
  await prisma.connection.create({
    data: {
      userId: alexJohnson.id,
      connectedUserId: sarahLee.id,
      status: "accepted"
    }
  });

  await prisma.connection.create({
    data: {
      userId: sarahLee.id,
      connectedUserId: alexJohnson.id,
      status: "accepted"
    }
  });

  await prisma.connection.create({
    data: {
      userId: michaelChen.id,
      connectedUserId: alexJohnson.id,
      status: "pending"
    }
  });

  // Create experiences
  await prisma.experience.create({
    data: {
      userId: alexJohnson.id,
      title: "Senior Software Engineer",
      company: "Tech Innovations",
      location: "San Francisco, CA",
      isCurrentRole: true,
      startDate: "2020-01",
      description: "Leading development of scalable web applications using React and Node.js."
    }
  });

  await prisma.experience.create({
    data: {
      userId: alexJohnson.id,
      title: "Software Engineer",
      company: "CodeCraft",
      location: "Seattle, WA",
      isCurrentRole: false,
      startDate: "2017-06",
      endDate: "2019-12",
      description: "Developed and maintained backend services using Java and Spring Boot."
    }
  });

  await prisma.experience.create({
    data: {
      userId: sarahLee.id,
      title: "Product Manager",
      company: "Creative Solutions",
      location: "New York, NY",
      isCurrentRole: true,
      startDate: "2019-03",
      description: "Managing the product lifecycle from conception to launch."
    }
  });

  // Create educations
  await prisma.education.create({
    data: {
      userId: alexJohnson.id,
      school: "University of California, Berkeley",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      startDate: "2013-09",
      endDate: "2017-05"
    }
  });

  await prisma.education.create({
    data: {
      userId: sarahLee.id,
      school: "Stanford University",
      degree: "Master of Business Administration",
      fieldOfStudy: "Business Administration",
      startDate: "2017-09",
      endDate: "2019-06"
    }
  });

  await prisma.education.create({
    data: {
      userId: michaelChen.id,
      school: "Massachusetts Institute of Technology",
      degree: "Master of Science",
      fieldOfStudy: "Data Science",
      startDate: "2015-09",
      endDate: "2017-05"
    }
  });

  // Create post likes
  await prisma.postLike.create({
    data: {
      postId: alexPost1.id,
      userId: sarahLee.id
    }
  });

  await prisma.postLike.create({
    data: {
      postId: sarahPost1.id,
      userId: alexJohnson.id
    }
  });

  await prisma.postLike.create({
    data: {
      postId: michaelPost1.id,
      userId: alexJohnson.id
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
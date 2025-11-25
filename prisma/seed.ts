import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  await prisma.projectImage.deleteMany();
  await prisma.projectVideo.deleteMany();
  await prisma.socialLinks.deleteMany();
  await prisma.projectCategory.deleteMany();
  await prisma.project.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'DeFi',
        description:
          'Decentralized Finance applications including DEXs, lending protocols, and yield farming platforms.',
        icon: '/category/defi.svg',
        projectCount: 0,
        featured: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'NFT & Gaming',
        description:
          'NFT marketplaces, gaming platforms, and digital collectibles built on Sui blockchain.',
        icon: '/category/nft-gaming.svg',
        projectCount: 0,
        featured: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Infrastructure',
        description:
          'Core infrastructure projects including nodes, validators, and network services.',
        icon: '/category/infrastructure.svg',
        projectCount: 0,
        featured: false,
      },
    }),
    prisma.category.create({
      data: {
        name: 'DAO & Governance',
        description:
          'Decentralized Autonomous Organizations and governance platforms for community decision-making.',
        icon: '/category/dao-governance.svg',
        projectCount: 0,
        featured: false,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Launchpad',
        description:
          'Platforms for launching new projects, token sales, and fundraising on Sui.',
        icon: '/category/launchpad.svg',
        projectCount: 0,
        featured: true,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Tooling',
        description:
          'Developer tools, SDKs, APIs, and utilities for building on Sui blockchain.',
        icon: '/category/tooling.svg',
        projectCount: 0,
        featured: false,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Naming Service',
        description:
          'Domain name services and identity solutions for the Sui ecosystem.',
        icon: '/category/naming-service.svg',
        projectCount: 0,
        featured: false,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Open Source',
        description:
          'Open source projects, libraries, and contributions to the Sui ecosystem.',
        icon: '/category/opensource.svg',
        projectCount: 0,
        featured: false,
      },
    }),
  ]);

  console.log('Categories created');

  // Create default admin user if not exists
  const adminPassword = 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash,
      role: 'admin',
    },
  });
  console.log(
    'Default admin user created (username: admin, password: admin123)'
  );

  const getCategoryId = (name: string) => {
    const category = categories.find(c => c.name === name);
    if (!category) throw new Error(`Category not found: ${name}`);
    return category.id;
  };

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Aftermath Finance',
        tagline: 'Optimal DeFi trading with minimal costs',
        description:
          'Aftermath is built for traders and investors who value speed, transparency, and decentralization. Powered by the Sui blockchain, our platform ensures optimal deals with minimal costs.',
        logo: 'https://c.animaapp.com/mdei0unhm8Lc4h/img/image-3.png',
        heroImage: 'https://c.animaapp.com/mdhad6w5lox3FE/img/background-1.svg',
        website: 'https://aftermath.finance',
        videoUrl: 'https://youtube.com/watch?v=aftermath-demo',
        featured: true,
        status: 'PUBLISHED',
        isHiring: true,
        careerPageUrl: 'https://aftermath.finance/careers',
        isOpenForBounty: false,
        isOpenSource: true,
        githubUrl: 'https://github.com/aftermath-finance',
        categories: {
          create: [
            { categoryId: getCategoryId('DeFi') },
            { categoryId: getCategoryId('Tooling') },
          ],
        },
        socialLinks: {
          create: {
            website: 'https://aftermath.finance',
            github: 'https://github.com/aftermath-finance',
            twitter: 'https://twitter.com/aftermath_fi',
            discord: 'https://discord.gg/aftermath',
            telegram: 'https://t.me/aftermath_finance',
            medium: 'https://medium.com/aftermath-finance',
          },
        },
        images: {
          create: [
            {
              url: 'https://c.animaapp.com/mdhad6w5lox3FE/img/background-1.svg',
              alt: 'Aftermath Finance Dashboard',
              order: 1,
            },
            {
              url: 'https://c.animaapp.com/mdhad6w5lox3FE/img/background.svg',
              alt: 'Aftermath Finance Analytics',
              order: 2,
            },
            {
              url: 'https://c.animaapp.com/mdhad6w5lox3FE/img/background-3.svg',
              alt: 'Aftermath Finance Vaults',
              order: 3,
            },
            {
              url: 'https://c.animaapp.com/mdhad6w5lox3FE/img/background-2.svg',
              alt: 'Aftermath Finance Strategy',
              order: 4,
            },
          ],
        },

        videos: {
          create: [
            {
              title: 'Aftermath Finance Overview',
              description:
                'Learn about Aftermath Finance and its innovative DeFi solutions',
              playbackId: 'aftermath-overview-playback-id',
              thumbnail:
                'https://c.animaapp.com/mdhco1b4hv2VQG/img/frame-95.png',
              featured: true,
            },
            {
              title: 'Aftermath Finance Tutorial',
              description: 'Step-by-step guide to using Aftermath Finance',
              playbackId: 'aftermath-tutorial-playback-id',
              thumbnail:
                'https://c.animaapp.com/mdhco1b4hv2VQG/img/frame-95-2.png',
              featured: false,
            },
          ],
        },
      },
    }),

    // Scallop (from frontend)
    prisma.project.create({
      data: {
        name: 'Scallop',
        tagline: 'Next Generation peer-to-peer Money Market for Sui',
        description:
          'Scallop is the pioneering Next Generation peer-to-peer Money Market for the Sui ecosystem and is also the first DeFi protocol to receive an official grant from the Sui Foundation.',
        logo: 'https://c.animaapp.com/mdei0unhm8Lc4h/img/image-4.png',
        website: 'https://scallop.io',
        featured: true,
        status: 'PUBLISHED',
        isHiring: false,
        isOpenForBounty: true,
        bountySubmissionUrl: 'https://scallop.io/bounty',
        isOpenSource: true,
        githubUrl: 'https://github.com/scallop-protocol',
        categories: {
          create: [
            { categoryId: getCategoryId('DeFi') },
            { categoryId: getCategoryId('Infrastructure') },
          ],
        },
        socialLinks: {
          create: {
            website: 'https://scallop.io',
            github: 'https://github.com/scallop-protocol',
            twitter: 'https://twitter.com/scallop_io',
            discord: 'https://discord.gg/scallop',
            telegram: 'https://t.me/scallop_io',
          },
        },

        videos: {
          create: [
            {
              title: 'Scallop Protocol Introduction',
              description:
                'Discover Scallop, the pioneering peer-to-peer Money Market',
              playbackId: 'scallop-intro-playback-id',
              thumbnail:
                'https://c.animaapp.com/mdhco1b4hv2VQG/img/frame-95-4.png',
              featured: true,
            },
          ],
        },
      },
    }),

    prisma.project.create({
      data: {
        name: 'Suilend',
        tagline: '#1 DeFi protocol on Sui with SEND token',
        description:
          'Since launching in March 2024, Suilend has rapidly become the #1 DeFi protocol on Sui. In December 2024, we introduced SEND, our token, through the pioneering mdrop mechanism.',
        logo: 'https://c.animaapp.com/mdei0unhm8Lc4h/img/image-5.png',
        website: 'https://suilend.fi',
        featured: true,
        status: 'PUBLISHED',
        isHiring: true,
        careerPageUrl: 'https://suilend.fi/careers',
        isOpenForBounty: true,
        bountySubmissionUrl: 'https://suilend.fi/bounty',
        isOpenSource: true,
        githubUrl: 'https://github.com/suilend',
        categories: {
          create: [
            { categoryId: getCategoryId('Open Source') },
            { categoryId: getCategoryId('DeFi') },
          ],
        },
        socialLinks: {
          create: {
            website: 'https://suilend.fi',
            github: 'https://github.com/suilend',
            twitter: 'https://twitter.com/suilend_fi',
            discord: 'https://discord.gg/suilend',
            telegram: 'https://t.me/suilend_fi',
          },
        },

        videos: {
          create: [
            {
              title: 'Suilend: #1 DeFi Protocol on Sui',
              description: 'Learn about Suilend and the SEND token',
              playbackId: 'suilend-overview-playback-id',
              thumbnail:
                'https://c.animaapp.com/mdhco1b4hv2VQG/img/frame-95-5.png',
              featured: true,
            },
          ],
        },
      },
    }),
  ]);

  console.log('Projects created');

  console.log('Projects and videos created');

  for (const category of categories) {
    const projectCount = await prisma.projectCategory.count({
      where: { categoryId: category.id },
    });

    await prisma.category.update({
      where: { id: category.id },
      data: { projectCount },
    });
  }

  console.log('Category project counts updated');

  console.log('Database seeding completed successfully!');
  console.log(
    `Created ${categories.length} categories and ${projects.length} projects`
  );
}

main()
  .catch(e => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

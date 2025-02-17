// images
import Logo from './assets/img/header/logo.svg';
import ResistanceImg from './assets/img/workouts/resistance.png';
import BoxingImg from './assets/img/workouts/boxing.png';
import BodyPumpImg from './assets/img/workouts/body-pump.png';
import YogaImg from './assets/img/workouts/yoga.png';
import FullBodyImg from './assets/img/workouts/full-body.png';
import FitnessImg from './assets/img/workouts/fitness.png';
import BattleRopeImg from './assets/img/workouts/battle-rope.png';
import CommunityImg1 from './assets/img/community/img1.png';
import CommunityImg2 from './assets/img/community/img2.png';
import CommunityImg3 from './assets/img/community/img3.png';
import CommunityImg4 from './assets/img/community/img4.png';
import JoinImg from './assets/img/join/woman.png';

// icons
import UsersIcn from './assets/img/about/icons/users-icn.svg';
import PriceIcn from './assets/img/pricing/icons/price.svg';
import CommunityIcn from './assets/img/community/icons/community-icn.svg';
import QuestionMarkIcn from './assets/img/faq/icons/question-mark.svg';


export const header = {
  logo: Logo,
  btnLoginText: 'Log in',
  btnSignupText: 'Sign Up',
};

export const nav = [
  { name: 'Home', href: '' },
  { name: 'About', href: '' },
  { name: 'Workouts', href: '' },
  { name: 'Pricing', href: '' },
  { name: 'Community', href: '' },
  { name: 'FAQ', href: '' },
];

export const banner = {
  titlePart1: 'Get the best part of your day',
  titlePart2: '– you fit here.',
  subtitle:
    'We provide serious fitness but within a fun and friendly, safe space. Experience AI-powered home workouts with real-time rep counting!',
  textBtn: 'Join Now',
  img: '',
};

export const about = {
  icon: UsersIcn,
  title: 'Our mission',
  subtitle1:
    'We are distinguished by our unsurpassed motivating atmosphere, knowledgeable staff, and premier exercise equipment, which supports our members in meeting their individual fitness goals.',
  subtitle2:
    'The strength of our heart-felt identity is utilized to inspire every person that steps foot into our gyms or joins our AI-powered home workout programs to better themselves.',
  link: 'Join Now',
};

export const workouts = {
  title: 'Training programs',
  programs: [
    {
      image: ResistanceImg,
      name: 'Resistance',
    },
    {
      image: BoxingImg,
      name: 'Boxing',
    },
    {
      image: BodyPumpImg,
      name: 'Body Pump',
    },
    {
      image: YogaImg,
      name: 'Yoga',
    },
    {
      image: FullBodyImg,
      name: 'Full Body',
    },
    {
      image: FitnessImg,
      name: 'Fitness',
    },
    {
      image: BattleRopeImg,
      name: 'Battle Rope',
    },
  ],
};

export const pricing = {
  icon: PriceIcn,
  title: 'Pricing plan',
  plans: [
    {
      name: 'Basic',
      price: '20',
      list: [
        { name: 'unlimited gym access' },
        { name: '1 training programs' },
        { name: 'free fitness consultation' },
        { name: 'access to AI home workout (basic)' }, // Added AI feature
      ],
      delay: 600,
    },
    {
      name: 'Premium',
      price: '35',
      list: [
        { name: 'unlimited gym access' },
        { name: '5 training programs' },
        { name: 'free fitness consultation' },
        { name: 'personal trainer' },
        { name: 'access to AI home workout (premium)' }, // Added AI feature
      ],
      delay: 800,
    },
    {
      name: 'Elite',
      price: '49',
      list: [
        { name: 'unlimited gym access' },
        { name: 'all training programs' },
        { name: 'free fitness consultation' },
        { name: 'personal trainer' },
        { name: '50% off drinks' },
        { name: 'full access to AI home workout' }, // Added AI feature
      ],
      delay: 1000,
    },
  ],
};

export const community = {
  icon: CommunityIcn,
  title: 'Community',
  testimonials: [
    {
      image: CommunityImg1,
      name: 'Mark A.',
      message:
        '“Great location, great price and great, helpful people. What to want more?”',
    },
    {
      image: CommunityImg2,
      name: 'Lauren K.',
      message:
        '“Gymme changed my life. Not only physically but mentally as well. I’m a better mother, and all around better human being because of this gym.”',
    },
    {
      image: CommunityImg3,
      name: 'Jhon D.',
      message:
        '“Love these workouts! Trainers are knowledgeable and motivating. Gymme is wonderful!”',
    },
    {
      image: CommunityImg4,
      name: 'Anne R.',
      message:
        '“The AI home workout system is a game-changer! It’s like having a personal trainer at home.”', // Updated testimonial
    },
  ],
};

export const faq = {
  icon: QuestionMarkIcn,
  title: 'FAQ',
  accordions: [
    {
      question: 'How can I book a workout class?',
      answer:
        'You can book a workout class by visiting our website or by using our mobile app. You can also book a class by calling our gym directly.',
    },
    {
      question: 'Can I pay by cash for my membership?',
      answer:
        'Yes, you can pay by cash for your membership. We also accept credit cards and UPI.',
    },
    {
      question: 'What age do I need to be to join?',
      answer:
        'You need to be at least 18 years old to join our gym. If you are under 18, you will need to have a parent or guardian sign a waiver for you.',
    },
    {
      question: 'Are there any lockers?',
      answer:
        'Yes, we have lockers available for our members to use.',
    },
    {
      question: 'How do I cancel my membership?',
      answer:
        'You can cancel your membership by visiting our website or by calling our gym directly.',
    },
    {
      question: 'Is there water available at the gym?',
      answer:
        'Yes, we have water fountains available for our members to use. We also have water bottles available for purchase.',
    },
    {
      question: 'How does the AI home workout system work?', // New FAQ
      answer:
        'Our AI home workout system uses advanced computer vision to track your movements and count your reps in real-time. It provides feedback and guidance to help you perform exercises correctly.',
    },
  ],
};

export const join = {
  image: JoinImg,
  title: 'Wanna join & have fun?',
  subtitle:
    'Join our online workout classes and get in the best shape of your life! Experience the future of fitness with our AI-powered home workouts.',
  btnText: 'Join now',
};

export const footer = {
  logo: Logo,
  copyrightText: 'All rights reserved. Gymme 2025.',
};
import { themeToCssVars } from "./Themes";

export const crazyIdeas = [
    { icon: '🌱', name: 'Spotify for Plants', description: 'Design a plant care app with 3 screens. Home shows plant collection with mood scores and watering streaks displayed as a vinyl-record style carousel. Plant detail screen plays a "growth playlist" of care reminders. Discover screen recommends new plants based on light conditions, with a Spotify-inspired dark theme using greens, soft gradients, and minimalist typography.' },
    { icon: '💼', name: 'Tinder for Jobs', description: 'Create a job-matching app with 3 screens. Swipe screen shows job cards with company logo, salary, vibe tags, and one-line role pitch — swipe right to apply, left to skip. Matches screen shows companies that liked your profile. Chat screen handles recruiter conversations with a playful, dating-app-inspired interface using bold gradients and rounded cards.' },
    { icon: '🍕', name: 'Uber for Leftovers', description: 'Design a food-sharing app with 3 screens. Map view shows nearby home cooks giving away leftover meals as live pins with photos and pickup times. Listing detail screen shows the dish, ingredients, allergens, and host rating. Order screen confirms pickup with a chat-driver-style live status. Use warm orange/red palette and food photography hero shots.' },
    { icon: '🧘', name: 'Duolingo for Therapy', description: 'Build a mental wellness app with 3 screens. Streak home screen shows daily mood check-ins with a friendly mascot and gamified XP bar. Lesson screen presents a CBT exercise as bite-sized cards with multiple-choice reflections. Progress screen visualizes mental health trends. Soft pastels, playful illustrations, encouraging tone.' },
    { icon: '🎮', name: 'GitHub for Gamers', description: 'Create a gaming social platform with 3 screens. Profile screen shows games as repos with playtime stats, achievements, and a contribution graph of game hours. Feed screen shows friends\' clips and trophies in card format. Compare screen lets you stat-battle against friends. Use neon purple/cyan, glassmorphism, and a slick dashboard feel.' },
    { icon: '☕', name: 'LinkedIn for Coffee Dates', description: 'Design a casual networking app with 2 screens. Discover screen shows nearby professionals open to a 20-min coffee chat with topic tags and availability. Booking screen picks a cafe + time slot with calendar integration. Warm browns, cozy illustrations, and friendly micro-copy.' },
    { icon: '👨‍🍳', name: 'Stack Overflow for Recipes', description: 'Build a recipe Q&A app with 3 screens. Question feed shows cooking problems with upvotes and best-answer badges. Answer detail screen shows ranked solutions with photos and ingredient swaps. Profile screen tracks reputation as "kitchen karma." Clean, technical, but warm with food photography accents.' },
    { icon: '🛏️', name: 'Airbnb for Naps', description: 'Design a power-nap rental app with 3 screens. Map shows nearby nap pods, quiet cafes, and rentable couches with hourly rates and noise level scores. Detail screen shows photos, amenities (eye masks, white noise), and reviews. Booking confirms with a sleepy-vibes dark mode and lavender accents.' },
    { icon: '📸', name: 'Instagram for Books', description: 'Create a reading social app with 3 screens. Feed shows friends\' current reads with mood-tagged stories and quote highlights. Profile shows shelf as Instagram-grid of book covers with personal ratings. Reading screen shows real-time progress with annotation reactions. Bookish cream/sepia palette with serif typography.' },
    { icon: '🚗', name: 'Tesla for Bikes', description: 'Design a smart bike companion app with 3 screens. Dashboard shows speed, battery, range, and live ride map. Trip planner suggests bike-friendly routes with elevation profiles. Health screen tracks calories, heart rate, and weekly streaks. Minimal Tesla-inspired UI with sharp typography and red accents.' },
    { icon: '🐶', name: 'Slack for Dogs', description: 'Create a dog playdate coordination app with 3 screens. Pack home screen shows your dog\'s "channels" — playmates, vet, walker — with unread activity counts. Channel detail shows photo updates and play scheduling. Profile screen is your dog\'s persona with traits. Playful Slack-inspired layout with paw-print accents.' },
    { icon: '🎨', name: 'Figma for Tattoos', description: 'Build a tattoo design collaboration app with 3 screens. Canvas screen lets users mock up tattoos on a 3D body model with layered designs. Artist marketplace shows portfolios and bookings. Booking detail screen confirms appointment with deposit. Dark, edgy palette with neon ink-style accents.' },
    { icon: '📰', name: 'TikTok for News', description: 'Design a news app with 3 screens. Vertical feed shows 15-second news summaries with auto-playing video and quick-fact overlays. Article expand screen has full story + sources. Topic profile screen shows trending stories per category. Bold, kinetic typography with high-contrast colors.' },
    { icon: '🎵', name: 'Discord for Concerts', description: 'Create a live concert companion app with 3 screens. Lobby screen shows ongoing concerts as voice rooms where fans react in real-time. Setlist screen tracks the live song queue with reaction emojis. Profile screen shows your concert history as collectible tickets. Vibrant, neon, energetic UI.' },
];

export const suggestions = [
    {
        icon: '✈️',
        name: 'Travel Planner App',
        description:
            'Design a travel planner with 2 screens. Home screen shows upcoming trips as destination cards with images, dates, and progress indicators. Trip details screen includes an interactive map, daily itinerary timeline, and booking summary cards using soft gradients, rounded layouts, and calm travel-inspired colors.'
    },
    {
        icon: '📚',
        name: 'AI Learning Platform',
        description:
            'Create an AI learning platform with 2 screens. Dashboard displays course progress, streak counter, and achievement badges in a colorful, gamified layout. Course screen shows lesson cards, completion states, and an AI tips panel with friendly icons and vibrant visuals.'
    },
    {
        icon: '💳',
        name: 'Finance Tracker',
        description:
            'Generate a finance tracker with 2 screens. Dashboard shows total balance, expense breakdown charts, and budget goals with clean data visuals. Transactions screen lists categorized expenses with icons, amounts, and status indicators using a minimal UI and optional dark mode.'
    },
    {
        icon: '🛒',
        name: 'E-Commerce Store',
        description:
            'Design an e-commerce app with 2 screens. Home screen features a product grid, category filters, and promotional banners. Product detail screen includes a large product image, price, reviews, and a strong add-to-cart CTA using a premium, conversion-focused layout.'
    },
    {
        icon: '📅',
        name: 'Smart To-Do Planner',
        description:
            'Create a smart to-do planner with 2 screens. Main screen shows today’s tasks with priority labels, checkboxes, and progress summary. Calendar screen highlights deadlines and task density per day using a clean, productivity-focused design.'
    },
    {
        icon: '🍔',
        name: 'Food Delivery App',
        description:
            'Generate a food delivery app with 2 screens. Home screen displays restaurant cards with ratings, delivery time, and cuisine tags. Restaurant screen shows large food images, categorized menu items, and add-to-cart buttons with bright, appetizing visuals.'
    },
    {
        icon: '👶',
        name: 'Kids Learning App',
        description:
            'Design a kids learning app with 2 screens. Home screen shows learning categories as colorful cards with playful icons. Activity screen includes interactive lessons, reward animations, and progress stars using fun illustrations and a cheerful color palette.'
    }
];



export const HtmlWrapper = (theme: any, htmlCode: string) => {
    return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>

  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">

  <!-- Tailwind + Iconify -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
<script src="https://code.iconify.design/3/3.1.1/iconify.min.js"></script>

  <style>
    ${themeToCssVars(theme)}
  </style>
</head>
<body class="bg-[var(--background)] pt-2 text-[var(--foreground)] w-full">
  ${htmlCode.replace('```html', '').replace('```', '') ?? ""}
</body>
</html>
`;

}
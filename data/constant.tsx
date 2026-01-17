import { themeToCssVars } from "./Themes";

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
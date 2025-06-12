This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Dependencies
npm install framer-motion
npm install react-slick slick-carousel
npm install lucide-react
npm install @emotion/react @emotion/styled lucide-react
npm install react-icons
npm install react-tabs

# Portfolio Sections

This folder contains the `Hero` section and other components for the portfolio project. The project is built using **Next.js** and styled with **Emotion**, with additional libraries for animations, icons, carousels, and tabs.

---

## Dependencies

### Core Libraries
- **React**: A JavaScript library for building user interfaces.
- **Next.js**: A React framework for server-side rendering, static site generation, and optimized performance.

### Styling
- **Emotion**: A CSS-in-JS library for styling React components.
  - Packages:
    - `@emotion/react`: Provides theming and runtime styling.
    - `@emotion/styled`: Enables styled components.

### Animations
- **Framer Motion**: A powerful library for creating animations and gestures in React.

### Carousel
- **React Slick**: A React component for creating carousels and sliders.
- **Slick Carousel**: Provides the required CSS files for React Slick.
  - Additional CSS files:
    - `slick-carousel/slick/slick.css`
    - `slick-carousel/slick/slick-theme.css`

### Icons
- **Lucide React**: A modern icon library for React.
- **React Icons**: Provides a wide range of icons from various libraries.

### Tabs
- **React Tabs**: A lightweight library for creating tabbed navigation in React.

### Custom Components
- **ScrollCue**: A custom component for scroll animations, imported from `@/components/ScrollCue`.

---

## Theme

The project uses Emotion's theming capabilities. The `ThemeProvider` provides theme properties that can be accessed throughout the application. Below are the theme properties defined in the project:

- `cardBg`: Background color for cards.
- `mutedText`: Color for muted text.
- `titleGradient`: Gradient used for titles.
- `primary`: Primary color used in the theme.
- `accent`: Accent color used for highlights.
- `text`: Default text color.

These properties are used in styled components to ensure consistent theming across the application.

---

## Installation

To set up the project, install the dependencies using the following commands:

### Step-by-Step Installation
1. Install Framer Motion for animations:
   ```bash
   npm install framer-motion
   ```

2. Install React Slick and Slick Carousel for carousels:
   ```bash
   npm install react-slick slick-carousel
   ```

3. Install Lucide React for icons:
   ```bash
   npm install lucide-react
   ```

4. Install Emotion for CSS-in-JS styling:
   ```bash
   npm install @emotion/react @emotion/styled
   ```

5. Install React Icons for additional icon support:
   ```bash
   npm install react-icons
   ```

6. Install React Tabs for tabbed navigation:
   ```bash
   npm install react-tabs
   ```

### Combined Installation
Alternatively, install all dependencies at once:
```bash
npm install framer-motion react-slick slick-carousel lucide-react @emotion/react @emotion/styled react-icons react-tabs
```

---

## Usage

### Hero Section
The `Hero` section is styled using Emotion and includes animations powered by Framer Motion. It also uses React Slick for carousel functionality and Lucide React for icons.

### Theme Integration
The project uses Emotion's `ThemeProvider` to provide a consistent theme across all components. The theme properties are accessed using the `theme` prop in styled components or the `useTheme` hook.

### Custom Components
The project includes custom components like `ScrollCue` for scroll-based animations.

---

## Development

To start the development server, run:

```bash
npm run dev
```

This will start the Next.js development server and allow you to preview your application locally.

---

## File Structure

```
src/
├── sections/
│   ├── Hero.tsx
│   ├── Projects.tsx
│   ├── Skills.tsx
│   ├── Research.tsx
│   ├── Gallery.tsx
│   ├── BlogPreview.tsx
│   ├── About.tsx
│   ├── Contact.tsx
├── components/
│   ├── ScrollCue.tsx
│   ├── DarkModeToggle.tsx
│   ├── ThemeClient.tsx
├── styles/
│   ├── globals.css
│   ├── theme.ts
```

---

## Features

- **Responsive Design**: The components are styled to adapt to different screen sizes.
- **Animations**: Smooth animations using Framer Motion.
- **Carousel**: Interactive sliders powered by React Slick.
- **Theming**: Dynamic theming with Emotion.
- **Icons**: Modern and customizable icons using Lucide React and React Icons.
- **Tabs**: Tabbed navigation for organizing content.

---

## License

This project is licensed under the [MIT License](LICENSE).
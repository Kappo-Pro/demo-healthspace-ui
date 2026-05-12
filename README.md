# VitalFlow: AI-Powered Rehabilitation Dashboard

![VitalFlow Header](https://via.placeholder.com/1200x400.png?text=VitalFlow+Rehabilitation+System)

VitalFlow is a professional-grade health-tech dashboard designed to showcase the integration of advanced AI/ML capabilities into a clinical rehabilitation workflow. This project transforms raw movement data into actionable clinical insights using real-time pose estimation and computer vision.

## 🚀 Key Features

### 1. AI-Driven Assessments
- **VitalScan ROM**: Automated Range of Motion analysis using MediaPipe and TensorFlow.js. Captures joint angles with clinical-grade precision.
- **VitalScan Posture**: 3D-assisted posture analysis identifying structural imbalances and alignment issues.
- **Real-time Feedback**: Instant visual overlays providing patients with corrective cues during exercise.

### 2. Intelligent Program Design
- **Automated Program Generation**: AI-recommended exercise plans based on assessment results and patient goals.
- **Dynamic Progression**: Smart adjustment of exercise difficulty based on historical performance metrics.

### 3. Clinical Dashboard
- **Patient Monitoring**: Comprehensive triage system for healthcare providers to track recovery progress.
- **Data Visualization**: Interactive charts (Recharts) showing trend analysis for ROM and functional goals.
- **Mobile-Responsive Design**: A premium, "glassmorphic" UI built with Ant Design and custom Tailwind tokens.

## 🛠️ Tech Stack

- **Core**: React 18, TypeScript, Redux Toolkit
- **AI/ML**: TensorFlow.js, MediaPipe (Holistic/Pose)
- **UI/UX**: Ant Design 5.x, Tailwind CSS, Framer Motion
- **Architecture**: Atomic Design Methodology
- **Testing**: Playwright (E2E), Jest, Axe-core (Accessibility)

## 📁 Architecture Overview

This project follows a strict **Atomic Design** pattern to ensure component reusability and scalability:
- `src/components/atoms`: Base UI elements (Buttons, Inputs, Badges)
- `src/components/molecules`: Compound components (Search bars, Chart cards)
- `src/components/organisms`: Complex feature blocks (Assessment flows, Dashboards)
- `src/stores`: Feature-sliced Redux state management
- `src/styles`: Token-based design system with multiple theme support (Light/Dark/Vibrant)

## 🔧 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm start
   ```

3. **Explore Components**:
   ```bash
   npm run storybook
   ```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Note: This repository is a sanitized portfolio version of an enterprise healthcare application, focused on showcasing frontend engineering and AI integration skills.*

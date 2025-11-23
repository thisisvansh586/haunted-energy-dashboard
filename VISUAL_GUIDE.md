# 👻 Haunted Energy Dashboard - Visual Guide

## 🎨 Color Palette

### Primary Colors
```css
--neon-green: #00FF9C     /* Primary actions, highlights */
--ghost-blue: #4CC9F0     /* Secondary actions, borders */
--bg-primary: #0A0A0F     /* Main background */
--bg-secondary: #11111A   /* Card backgrounds */
```

### Accent Colors
```css
--warning-orange: #FF6B35  /* Warnings */
--danger-red: #D7263D      /* Errors, critical alerts */
--text-primary: #E0E0E0    /* Main text */
--text-secondary: #8B92A8  /* Secondary text */
```

## 🎭 Component States

### Buttons
- **Default**: Border with transparent background
- **Hover**: Lifted (translateY -2px) with glow
- **Active**: Gradient background with shadow
- **Disabled**: 60% opacity, no pointer events

### Cards
- **Default**: Subtle border with background
- **Hover**: Enhanced shadow, slight scale
- **Active**: Brighter border color

### Links
- **Default**: Muted color
- **Hover**: Neon green with underline animation
- **Active**: Gradient background with glow

## 📐 Spacing System

### Padding Scale
- `0.5rem` (8px) - Tight spacing
- `0.75rem` (12px) - Small elements
- `1rem` (16px) - Standard spacing
- `1.5rem` (24px) - Medium spacing
- `2rem` (32px) - Large spacing
- `3rem` (48px) - Extra large spacing

### Gap Scale
- `0.5rem` - Tight gaps
- `1rem` - Standard gaps
- `1.5rem` - Medium gaps
- `2rem` - Large gaps

## 🎬 Animation Timing

### Duration
- **Fast**: 0.2s - Micro-interactions
- **Standard**: 0.3s - Most transitions
- **Slow**: 0.5s - Entrance animations
- **Very Slow**: 1s+ - Background effects

### Easing Functions
```css
/* Standard */
cubic-bezier(0.4, 0, 0.2, 1)

/* Bounce */
cubic-bezier(0.68, -0.55, 0.265, 1.55)

/* Ease Out */
ease-out

/* Linear */
linear (for infinite animations)
```

## 🌟 Special Effects

### Neon Glow
```css
box-shadow: 0 0 20px rgba(0, 255, 156, 0.5);
text-shadow: 0 0 15px rgba(0, 255, 156, 0.5);
```

### Gradient Border
```css
border: 2px solid;
border-image: linear-gradient(135deg, #4CC9F0, #00FF9C) 1;
```

### Backdrop Blur
```css
backdrop-filter: blur(10px);
background: rgba(13, 15, 23, 0.98);
```

### Ripple Effect
```css
.button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(76, 201, 240, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.button:hover::before {
  width: 300px;
  height: 300px;
}
```

## 📱 Responsive Design

### Breakpoints
```css
/* Desktop */
@media (min-width: 1200px) { }

/* Tablet */
@media (max-width: 1200px) { }

/* Mobile */
@media (max-width: 768px) { }

/* Small Mobile */
@media (max-width: 480px) { }
```

### Mobile Adjustments
- Navigation stacks vertically
- Grid becomes single column
- Font sizes reduce by 20%
- Touch targets minimum 44px
- Reduced padding/margins

## 🎯 Interactive States

### Hover Effects
1. **Lift**: `transform: translateY(-2px)`
2. **Scale**: `transform: scale(1.05)`
3. **Glow**: Enhanced box-shadow
4. **Color**: Transition to accent color

### Focus States
- Outline removed
- Border color changes to neon green
- Glow effect added
- Background slightly lighter

### Active States
- Slight scale down
- Immediate feedback
- Color inversion for buttons

## 🌈 Gradient Patterns

### Primary Gradient
```css
background: linear-gradient(135deg, #4CC9F0 0%, #00FF9C 100%);
```

### Background Gradient
```css
background: linear-gradient(135deg, #0A0A0F 0%, #11111A 100%);
```

### Card Gradient
```css
background: linear-gradient(135deg, 
  rgba(76, 201, 240, 0.1) 0%, 
  rgba(0, 255, 156, 0.05) 100%
);
```

## 🎪 Animation Library

### Entrance Animations
- `fadeIn` - Opacity 0 → 1, translateY 20px → 0
- `slideInLeft` - translateX -50px → 0
- `slideInRight` - translateX 50px → 0
- `scaleIn` - scale 0.8 → 1
- `slideUp` - translateY 50px → 0

### Continuous Animations
- `pulse` - Opacity and scale oscillation
- `glow` - Text-shadow intensity change
- `rotate` - 360° rotation
- `fogDrift` - Slow movement animation
- `floatUp` - Vertical movement

### Interaction Animations
- `shake` - Horizontal oscillation (errors)
- `neonPulse` - Glow intensity change
- `flicker` - Opacity variation
- `glitch` - Transform and hue-rotate

## 🎨 Typography

### Font Sizes
- **H1**: 2.5rem (40px)
- **H2**: 2rem (32px)
- **H3**: 1.5rem (24px)
- **Body**: 1rem (16px)
- **Small**: 0.875rem (14px)
- **Tiny**: 0.75rem (12px)

### Font Weights
- **Normal**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Line Heights
- **Tight**: 1.2
- **Normal**: 1.5
- **Relaxed**: 1.6
- **Loose**: 1.8

## 🔮 Haunted Theme Elements

### Fog Effect
- Radial gradient overlay
- Blur filter (40px)
- Slow drift animation (25s)
- Low opacity (0.05)

### Particles
- Small dots (4px)
- Floating upward animation
- Staggered delays
- Fade in/out

### Glitch Effect
- Rapid transform changes
- Hue-rotate filter
- Short duration (0.3s)
- Triggered on anomalies

### Neon Signs
- Text-shadow with color
- Pulsing animation
- Multiple shadow layers
- Glow intensity variation

## 📊 Component Hierarchy

### Z-Index Layers
```css
z-index: 1    /* Fog overlay, particles */
z-index: 10   /* Cards, content */
z-index: 100  /* Navigation, modals */
z-index: 1000 /* Tooltips, dropdowns */
```

### Stacking Context
- Navigation: Sticky, z-index 100
- Modals: Fixed, z-index 1000
- Tooltips: Absolute, z-index 1000
- Background effects: Fixed, z-index 1

## 🎯 Accessibility

### Focus Indicators
- Visible outline or glow
- High contrast
- Minimum 2px width
- Color change on focus

### Color Contrast
- Text: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Clear visual feedback

### Motion
- Respect `prefers-reduced-motion`
- Provide alternatives to animations
- Keep animations subtle

## 🚀 Performance Tips

### GPU Acceleration
- Use `transform` instead of `top/left`
- Use `opacity` for fading
- Add `will-change` for animated properties

### Efficient Selectors
- Avoid deep nesting
- Use classes over complex selectors
- Minimize specificity

### Animation Performance
- Limit simultaneous animations
- Use `requestAnimationFrame` for JS animations
- Debounce scroll/resize handlers

---

**Dashboard Theme**: Haunted Energy 👻⚡
**Style**: Dark, Neon, Futuristic
**Mood**: Mysterious, Elegant, Powerful

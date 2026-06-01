# Design: Fix Profile Avatars and Card Heroes with Developer Adjuster

## 1. Round Avatars Centering Fix
- In `src/app/profile/page.tsx`, the current circular wrapper has `flex justify-center items-end` and the image has `w-[150%] h-[150%] object-contain origin-bottom`.
- We will change the wrapper to `flex justify-center items-center` and the image to `w-full h-full object-cover`.
- This ensures the square pre-cropped player avatars are perfectly centered inside the 40px circular container.

## 2. Card Hero Dynamic Alignment System
- We will create `src/data/heroAlignments.ts` to host the `AlignmentConfig` interface and a coordinate mapping for the 51 heroes.
- The default alignment will be `scale: 1.8`, `translateX: 0`, and `translateY: 15` (sensible defaults that fit most heroes from high-resolution images).
- In `src/components/OWCard.tsx`, instead of hardcoded Tailwind classes, we will apply an inline `transform: scale(${scale}) translate(${translateX}%, ${translateY}%)` style with `transformOrigin: "top center"`.
- This ensures fluid real-time scaling and translation when tweaked in our developer adjuster.
- We will move the name tag to the bottom-left (`absolute bottom-2.5 left-2.5`).

## 3. Developer Adjuster Page
- We will create `src/app/adjuster/page.tsx` (accessible at `http://localhost:3000/adjuster`).
- The page will provide:
  - An interactive preview of `OWCard` displaying selected heroes.
  - A hero selector dropdown to choose any hero.
  - Sliders for Scale (1.0 to 3.0), Translate X (-50% to 50%), and Translate Y (-50% to 50%).
  - A **Lock/Unlock Button (固定數據)**: Disables the sliders to protect adjustments from accidental clicks.
  - A **Reset Button (重置預設)**: Restores scale to 1.8, translateX to 0, and translateY to 15 instantly.
  - A **Copy Code Button (複製設定 JSON)**: Copies the generated JSON object to the clipboard.

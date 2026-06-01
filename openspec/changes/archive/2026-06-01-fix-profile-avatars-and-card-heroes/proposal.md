# Proposal: Fix Profile Avatars and Card Heroes

## 1. Background
In the current Overwatch Social profile page:
- The round hero avatars in the selection grid of the editing panel are misaligned and cut off at the top.
- The hero images displayed in the player card cards are too small due to transparent padding in the official OW2 full-body/chest-up images from `hero_images`.

## 2. Objective
- Centering and correctly fitting the round hero avatars in the profile edit panel grid to prevent truncation.
- Implementing Option 2 for player cards: Restoring the high-fidelity half-body chest-up style with vertical divider lines, using the localized official OW2 chest-up portraits from `D:\AI\overwatch\hero_images` (copied to `/images/heroes/full/`), scaled up by 1.45x and offset by `translate-y-[8%]` to remove transparent padding and fit perfectly.

## 3. Scope
- Modify `src/app/profile/page.tsx` for round avatar styling.
- Modify `src/components/OWCard.tsx` for card hero image styling and dividers.

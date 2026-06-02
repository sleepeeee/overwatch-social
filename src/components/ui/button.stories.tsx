import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Sparkles } from "lucide-react";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "建立遊戲名片",
    className: "calm-btn-primary",
  },
};

export const WithIcon: Story = {
  render: () => (
    <Button className="calm-btn-primary">
      <Sparkles size={14} />
      建立遊戲名片
    </Button>
  ),
};

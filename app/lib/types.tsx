export type Story = {
  id: string;
  mediaUrl: string;
  createdAt: string;
  viewed: boolean;
};

export type UserStoryGroup = {
  user: {
    id: string;
    name: string;
    avatarURL: string;
  };
  stories: Story[];
};
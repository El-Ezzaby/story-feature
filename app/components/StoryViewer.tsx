'use client'

import { useState, useEffect } from 'react'
import { UserStoryGroup } from '../lib/types'

export default function StoryViewer(
  {group, onClose}:
  {
    group: UserStoryGroup;
    onClose: () => void;
  }
) {
  //Track current story index
  const [currentIndex, setCurrentIndex] = useState(0)
  //Track progress bar percentage
  const [progress, setProgress] = useState(0)

  const currentStory = group.stories[currentIndex];
  const STORY_DURATION = 5000; //story lasts for 5 seconds

  //progress bar and auto next
  useEffect(() => {
    setTimeout(() => setProgress(0), 0); //reset progress when switching stories
    const intervalTime = 50; //update every 50 ms
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += intervalTime
      const nextProgress = Math.min((elapsed / STORY_DURATION) * 100, 100)
      setProgress(nextProgress)

      if (nextProgress >= 100) {
        clearInterval(timer)
        if (currentIndex < group.stories.length - 1) {
          setCurrentIndex(currentIndex + 1)
        } else {
          onClose()
        }
      }
    }, intervalTime)
    
    //clear interval when story changes
    return () => clearInterval(timer);
  }, [currentIndex, group.stories.length, onClose])

  // Tap (click) to skip (Left side = Back, Right side = Forward)
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const middleX = rect.width / 2;

    if (clickX < middleX) {
      // Left side clicked: Go back if we aren't on the first story
      if (currentIndex > 0) {
        setCurrentIndex((c) => c - 1);
        setProgress(0);
      }
    } else {
      // Right side clicked: Go forward, or close if it's the last story
      if (currentIndex < group.stories.length - 1) {
        setCurrentIndex((c) => c + 1);
        setProgress(0);
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="relative w-full max-w-sm h-full md:h-[85vh] md:rounded-2xl overflow-hidden bg-zinc-900 flex flex-col justify-between select-none"
        onClick={handleClick}>
          {/* Top progress bars */}
          <div className="absolute top-0 inset-x-0 z-20 flex space-x-1 p-3">
            {group.stories.map((story, idx) => (
              <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-75"
                style={{
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                }}
              />
              </div>
            ))}
          </div>

          {/* Header (user info and close button) */}
          <div className="absolute top-5 inset-x-0 z-20 flex items-center justify-between px-4 mt-2">
            <div className="flex items-center space-x-2">
              <img src={group.user.avatarURL} className="w-8 h-8 rounded-full object-cover border border-white/50" />
              <span className="text-white font-medium text-sm drop-shadow">{group.user.name}</span>
            </div>
            <button onClick={onClose} className="text-white text-2xl font-bold px-2 drop-shadow">×</button>
          </div>

          {/* Story Media Display */}
          <div className="flex-1 flex its-center justify-center bg-black">
            <img src={currentStory.mediaUrl} className="w-full h-full object-contain" />
          </div>
      </div>
    </div>
  )
}
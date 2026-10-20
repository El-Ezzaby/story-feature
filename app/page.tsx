'use client'

import { useState, useRef } from 'react'
import { UserStoryGroup, Story } from './lib/types'
import { resizeImage } from './lib/imageUtils'
import StoryViewer from './components/StoryViewer'

export default function StoriesPage() {
  const [selectedGroup, setSelectedGroup] = useState<UserStoryGroup | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const CURRENT_USER_ID = 'my-local-user'


  //Loads localStorage safely on startup and filters out expired stories
  const [storyGroups, setStoryGroups] = useState<UserStoryGroup[]>(() => {
    if (typeof window === 'undefined') return [];

    const saved = localStorage.getItem('client_stories');
    const now = new Date().getTime();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;


    //mock group
    const initialData: UserStoryGroup[] = saved
      ? (JSON.parse(saved) as Array<UserStoryGroup & {
          user: UserStoryGroup['user'] & { avatarUrl?: string };
        }>).map((group) => ({
          ...group,
          user: {
            ...group.user,
            avatarURL: group.user.avatarURL || group.user.avatarUrl || '',
          },
        }))
      : [
      {
        user: {
          id: 'user-2',
          name: 'Tom Holland',
          avatarURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREijpBTwAFk8fUVGtG381mi9teC6Ll1BRfEAzm48-s_w&s=10'
        },
        stories: [
          {
            id: 'mock-1',
            mediaUrl: 'https://is.zobj.net/image-server/v1/images?r=_aJSU7Y1R-WureOAVSaaZws92VIiN9bHsTxX3iCcCGetqW0xHWPc0EArgigsu41iT3S3qW_w2q6AT4bUqBPcllrlrq6y109zyXU5On4pz3vQLWu9hl0AC5UHvqoBDBbaGB9uV-dpAFh5jg9HMxbOBHnHb2HGJ-93xtusgX0gcwgGE87lAv59nZBG-WUfSrfM9q_ndzWB1BBXc3nxVeQ8bSnVuIyIgV_fvG4q-wqRhrPB4QlR5gTW4XupNkM',
            createdAt: new Date().toISOString(),
            viewed: false,
          }
        ]
      }
    ];

    return initialData
      .map((group) => ({
        ...group,
        stories: group.stories.filter((story) => {
          const storyTime = new Date(story.createdAt).getTime();
          return now - storyTime < TWENTY_FOUR_HOURS;
        }),
      }))
      .filter((group) => group.stories.length > 0 || group.user.id === 'my-local-user');
  });

  //saves state updates to localStorage
  const saveToStorage = (updated: UserStoryGroup[]) => {
    setStoryGroups(updated)
    localStorage.setItem('client_stories', JSON.stringify(updated))
  }

  //Storage for file selection, image resizing and base64
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;

    setIsUploading(true);
    try{
      //compress and resize
      const base64Url = await resizeImage(file)

      const newStory: Story = {
        id: Math.random().toString(36).substring(2, 9),
        mediaUrl: base64Url,
        createdAt: new Date().toISOString(),
        viewed: false
      }

      const updated = [...storyGroups]
      const myGroup = updated.find((g) => g.user.id === CURRENT_USER_ID)

      if (myGroup) {
        myGroup?.stories.push(newStory)
      } else {
        updated.unshift({
          user: {
            id: CURRENT_USER_ID,
            name: 'You',
            avatarURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmcNdvjLzwocXrtJmVAkd-QnPJxYid_L8ZVWoedkOR9YXVNEYUmUhpyS55&s=10'
          },
          stories: [newStory]
        })
      }
      saveToStorage(updated)
    } catch (error) {
      console.error('Error processing image: ', error)
      alert('Failed to process image upload.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  //open story viwer and mark stories as viewed
  const handleSelectGroup = (group: UserStoryGroup) => {
    setSelectedGroup(group)

    const updated = storyGroups.map((g) => {
      if (g.user.id === group.user.id) {
        return {
          ...g,
          stories: g.stories.map((s) => ({...s, viewed: true}))
        }
      }
      return g
    })
    saveToStorage(updated)
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden">

        {/* Header title */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-lg font-bold bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent inline-block">
            Stories Feed
          </h1>
        </div>
        
        {/* Stories tray */}
        <div className="flex space-x-4 p-4 overflow-x-auto border-b border-gray-200 scrollbar-none items-center">

          {/* Plus button (upload button) */}
          <div onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center flex-shrink-0 cursor-pointer">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-500 flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition">
              {isUploading ? (<div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />)
               : (<span className="text-2xl text-blue-500 font-light">+</span>)}
            </div>
            <span className="text-xs mt-1 text-gray-600">Add Story</span>
          </div>

          {/* Hidden file input element */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden" 
          />

          {/* User Story Bubbles */}
          {storyGroups.map((group) => {
            const hasUnseen = group.stories.some((s) => !s.viewed)
            if (group.stories.length === 0) return null

            return (
              <div key={group.user.id} onClick={() => handleSelectGroup(group)} className="flex flex-col items-center flex-shrink-0 cursor-pointer">
                {/* Graient ring if unseen, gray if viewed */}
                <div className={`p-[2px] rounded-full ${hasUnseen ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' : 'bg-gray-300'}`}>
                  <div className="p-[2px] bg-white rounded-full">
                    <img src={group.user.avatarURL} alt={group.user.name} className="w-14 h-14 rounded-full object-cover" />
                  </div>
                </div>
                <span className="text-xs mt-1 text-gray-700 truncate w-16 text-center">{group.user.name}</span>
              </div>
            )
          })}
        </div>
        {/* Dashboard Feed Body Area */}
        <div className="p-12 text-center text-gray-400 text-sm">
          Tap any story bubble above to view active content 👆
        </div>
      </div>

      {/* Fullscreen Story Viewer Modal */}
      {selectedGroup && (
        <StoryViewer 
          group={selectedGroup} 
          onClose={() => setSelectedGroup(null)} 
        />
      )}
      
    </main>
  )
}
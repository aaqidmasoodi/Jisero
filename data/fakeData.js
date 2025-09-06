// Fake user data
const fakeUser = {
  id: 1,
  username: "john_doe",
  email: "john@example.com",
  name: "John Doe",
  avatar: "https://picsum.photos/200/300?random=1",
  status: "Online",
  theme: "light",
  notifications: true,
  privacy: {
    lastSeen: "everyone",
    profilePhoto: "everyone",
    about: "everyone",
    readReceipts: true
  },
  dataUsage: {
    total: "2.3 GB",
    messages: "1.1 GB",
    media: "1.2 GB",
    lastBackup: "2023-11-15"
  }
};

// Fake chats data
const fakeChats = [
  {
    id: 1,
    name: "Sarah Wilson",
    avatar: "https://picsum.photos/200/300?random=2",
    lastMessage: "Hey, how are you doing?",
    timestamp: "10:30 AM",
    unreadCount: 3,
    isPinned: true,
    messages: [
      { id: 1, text: "Hi there!", sender: "other", timestamp: "10:25 AM", status: "read", reactions: [] },
      { id: 2, text: "Hey, how are you doing?", sender: "other", timestamp: "10:30 AM", status: "read", reactions: [] },
      { id: 3, text: "I'm good, thanks for asking!", sender: "me", timestamp: "10:31 AM", status: "read", reactions: [{ emoji: "👍", count: 1 }] }
    ],
    media: [
      { id: 1, type: "image", url: "https://picsum.photos/200/300?random=10", timestamp: "Nov 10" },
      { id: 2, type: "image", url: "https://picsum.photos/200/300?random=11", timestamp: "Nov 8" },
      { id: 3, type: "document", name: "project.pdf", size: "2.4 MB", timestamp: "Nov 5" }
    ],
    links: [
      { id: 1, url: "https://example.com/project", title: "Project Details", timestamp: "Nov 10" },
      { id: 2, url: "https://example.com/meeting", title: "Meeting Notes", timestamp: "Nov 8" }
    ]
  },
  {
    id: 2,
    name: "Alex Johnson",
    avatar: "https://picsum.photos/200/300?random=3",
    lastMessage: "Let's meet tomorrow at 3pm",
    timestamp: "Yesterday",
    unreadCount: 0,
    isPinned: false,
    messages: [
      { id: 1, text: "Are you free tomorrow?", sender: "me", timestamp: "Yesterday 2:30 PM", status: "read", reactions: [] },
      { id: 2, text: "Let's meet tomorrow at 3pm", sender: "other", timestamp: "Yesterday 2:35 PM", status: "read", reactions: [] }
    ],
    media: [],
    links: []
  },
  {
    id: 3,
    name: "Emily Chen",
    avatar: "https://picsum.photos/200/300?random=4",
    lastMessage: "Did you see that new movie?",
    timestamp: "Tuesday",
    unreadCount: 1,
    isPinned: true,
    messages: [
      { id: 1, text: "Did you see that new movie?", sender: "other", timestamp: "Tuesday 8:15 PM", status: "delivered", reactions: [] }
    ],
    media: [],
    links: []
  },
  {
    id: 4,
    name: "Michael Brown",
    avatar: "https://picsum.photos/200/300?random=5",
    lastMessage: "Thanks for the help!",
    timestamp: "Monday",
    unreadCount: 0,
    isPinned: true,
    messages: [
      { id: 1, text: "I really appreciate it", sender: "other", timestamp: "Monday 4:20 PM", status: "read", reactions: [] },
      { id: 2, text: "Thanks for the help!", sender: "other", timestamp: "Monday 4:22 PM", status: "read", reactions: [{ emoji: "❤️", count: 1 }] }
    ],
    media: [],
    links: []
  },
  {
    id: 5,
    name: "Jessica Taylor",
    avatar: "https://picsum.photos/200/300?random=6",
    lastMessage: "Can you send me the file?",
    timestamp: "Sunday",
    unreadCount: 5,
    isPinned: false,
    messages: [
      { id: 1, text: "Can you send me the file?", sender: "other", timestamp: "Sunday 11:30 AM", status: "sent", reactions: [] },
      { id: 2, text: "I'll send it right away", sender: "me", timestamp: "Sunday 11:32 AM", status: "delivered", reactions: [] }
    ],
    media: [],
    links: []
  }
];

// Common emojis for picker
const commonEmojis = [
  "😀", "😁", "😂", "🤣", "😃", "😄", 
  "😅", "😆", "😉", "😊", "😋", "😎", 
  "😍", "😘", "🥰", "😗", "😙", "😚", 
  "🙂", "🤗", "🤔", "🤨", "😐", "😑", 
  "👍", "👎", "👏", "🙌", "👌", "✌️",
  "❤️", "🧡", "💛", "💚", "💙", "💜"
];

// Reaction emojis
const reactionEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];

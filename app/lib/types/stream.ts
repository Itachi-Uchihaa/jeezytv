export interface Stream {
    id: string
    title: string
    description: string
    userId: string
    isLive: boolean
    viewerCount: number
    rtmpUrl: string
    streamKey: string
    playbackUrl: string
    createdAt: any
    thumbnailUrl?: string
  }
  
  export interface CreateStreamData {
    title: string
    description: string
    isLive: boolean
    viewerCount: number
    userId: string
    rtmpUrl: string
    streamKey: string
    playbackUrl: string
    thumbnailUrl?: string
    createdAt: any
  }
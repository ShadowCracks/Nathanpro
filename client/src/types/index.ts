// src/types/index.ts

export interface User {
    id: string;
    email: string;
    name: string;
    hasPurchasedCourse: boolean;
  }
  
  export interface CourseModule {
    id: string;
    title: string;
    description: string;
    youtube_url: string;
    youtube_video_id: string;
    order_index: number;
  }
  
  export interface Purchase {
    id: string;
    product_type: 'course' | 'ebook';
    amount: number;
    status: string;
    purchased_at: string;
  }
export interface Assignment {
  id: number;
  course_id: number;
  assignment_name: string;
  grader_id?: string;
  grader_name?: string;
}

export interface Course {
  id: number;
  prefix: string;
  code: number;
  name: string;
  section: string;
  semester: 'FA' | 'SP' | 'SU';
  year: number;
}

export interface Message {
  id: number;
  appeal_id: number;
  created_at: Date;
  from_grader: boolean;
  message_id: number;
  message_text: string;
  recipient_id: string;
  sender_id: string;
  recipient_name: string;
  sender_name: string;
  is_read: boolean;
  has_image: boolean;
}

export interface ImageMessage {
  id: number;
  appeal_id: number;
  created_at: Date;
  from_grader: boolean;
  message_id: number;
  message_text: string;
  recipient_id: string;
  sender_id: string;
  recipient_name: string;
  sender_name: string;
  is_read: boolean;
  has_image: boolean;
  image?: Blob;
}

export interface Profile {
  id: string;
  role: string;
  first_name: string;
  last_name: string;
  email: string;
  confirmed_at?: string;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_verified: boolean;
}

export interface Grader extends Student {}

export interface Professor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface StudentCourse {
  student_id: string;
  course_id: number;
  is_grader: boolean;
}

export interface Appeal {
  id: number;
  created_at: Date;
  assignment_id: number;
  appeal_text: string;
  is_open: boolean;
  grader_id: string | null;
  grader_name: string | null;
  last_modified: Date | null;
  professor_id: string;
}

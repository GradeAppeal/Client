export interface Assignment {
  id: number;
  course_id: number;
  assignment_name: string;
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
  created_at: Date;
  sender_id: number;
  recipient_id: number;
  appeal_id: number;
  message_text: string;
  from_grader: boolean;
  sender_name: string;
  recipient_name: string;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_grader: boolean;
  //role: string;
}

export interface Professor {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface StudentCourse {
  student_id: string;
  course_id: number;
  is_grader: boolean;
  //role: string;
}

export interface StudentCourse {
  course_code: number;
  course_id: number;
  course_name: string;
  course_prefix: string;
  course_section: string;
  course_semester: 'FA' | 'SP' | 'SU';
  course_year: number;
  professor_name: string;
  is_grader: boolean;
}

export interface NewAppeal {
  student_name: string;
  student_email: string;
  selected_assignment: string;
  grade: string;
  reason: string;
  created_at: string;
}

export interface StudentAppeal {
  course_prefix: string;
  course_code: number;
  course_name: string;
  course_section?: string | null;
  course_semester: 'FA' | 'SP' | 'SU';
  course_year: number;
  professor_id: number;
  professor_first_name: string;
  professor_last_name: string;
  assignment_id: number;
  assignment_name: string;
  appeal_id: number;
  created_at: Date;
  is_open: boolean;
}

export interface ProfessorAppeal {
  appeal_id: number;
  appeal_text: string;
  assignment_id: number;
  assignment_name: string;
  code: number;
  created_at: Date;
  is_open: boolean;
  prefix: string;
  student_id: string;
  student_name: string;
  appeal_grade: number;
  student_first_name?: string;
  student_last_name?: string;
}

export interface ProfessorTemplate {
  professor_id: number;
  id: number;
  temp_text: string;
  temp_name: string;
}

export interface ProfessorCourse {}

export interface ParsedStudent {
  first_name: string;
  last_name: string;
  email: string;
}

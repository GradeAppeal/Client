export interface ProfessorCourse {
  code: number;
  id: number;
  name: string;
  prefix: string;
  section: string;
  semester: 'FA' | 'SP' | 'SU';
  year: number;
}

export interface ProfessorAppeal {
  appeal_id: number;
  appeal_text: string;
  assignment_id: number;
  code: number;
  created_at: Date;
  is_open: boolean;
  prefix: string;
  student_id: number;
  student_name: string;
}

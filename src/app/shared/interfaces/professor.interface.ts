export interface ProfessorAppeal {
  appeal_id: number;
  appeal_text: string;
  assignment_id: number;
  assignment_name: string;
  code: number;
  created_at: Date;
  is_open: boolean;
  prefix: string;
  student_id: number;
  student_name: string;
  appeal_grade: number;
}

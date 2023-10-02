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
  code: number;
  course_name: string;
  course_section: string;
  course_semester: string;
  course_year: number;
  student_id: number;
  student_name: string;
  assignment_id: number;
  appeal_id: number;
  created_at: Date;
  appeal_text: string;
  is_open: boolean;
}

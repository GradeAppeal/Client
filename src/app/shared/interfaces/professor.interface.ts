export interface ProfessorAppeal {
  appeal_id: number;
  appeal_text: string;
  assignment_id: number;
  assignment_name: string;
  course_id: number;
  course_code: number;
  course_name: string;
  course_prefix: string;
  course_section: string;
  course_semester: string;
  course_year: number;
  created_at: Date;
  is_open: boolean;
  prefix: string;
  student_name: string;
  appeal_grade: number;
  appeal_complete: boolean;
  student_first_name?: string;
  student_id: string;
  student_last_name?: string;
  grader_id?: string;
  grader_name?: string;
  last_modified?: Date | string;
}

export interface ProfessorTemplate {
  professor_id: number;
  id: number;
  temp_text: string;
  temp_name: string;
}

export interface ParsedStudent {
  first_name: string;
  last_name: string;
  email: string;
}

export interface StudentCourseGraderInfo {
  student_id: string;
  student_name: string;
  email: string;
  course_id: number;
  course_name: string;
  is_grader: boolean;
}

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
  student_name : string;
  student_email : string;
  selected_assignment : string;  
  grade : string;
  reason: string;
  created_at : string;
}

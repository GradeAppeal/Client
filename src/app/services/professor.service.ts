import { Injectable } from '@angular/core';
import { AuthSession, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './auth.service';
import { Course, Student } from 'src/app/shared/interfaces/psql.interface';
import {
  ProfessorAppeal,
  ProfessorTemplate,
} from '../shared/interfaces/professor.interface';

@Injectable({
  providedIn: 'root',
})
export class ProfessorService {
  private supabase: SupabaseClient;
  session: AuthSession | null = null;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.client;
    this.session = this.supabaseService.session;
  }

  /**
   * fetch from supabase: professor courses
   * @param pid professor id (later replaced with auth.id)
   * @returns courses the prof is teaching in JSON format
   */
  async fetchProfessorCourses(pid: string): Promise<Course[]> {
    const { data, error } = await this.supabase.rpc('get_professor_courses', {
      pid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchProfessorCourses');
    }
    return data;
  }

  /**
   * fetch from supabase: professor appeals
   * @param pid professor id (later replaced with auth.id)
   * @returns courses the prof is teaching in JSON format
   */
  async fetchProfessorAppeals(pid: string): Promise<ProfessorAppeal[]> {
    console.log(pid);
    const { data, error } = await this.supabase.rpc('get_professor_appeals', {
      pid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchProfessorAppeals');
    }
    return data;
  }

  async fetchStudents(cid: number): Promise<Student[]> {
    const { data, error } = await this.supabase.rpc('get_students', {
      cid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchStudents');
    }
    return data;
  }

  /**
   * Fetch students for a particular course
   * @param cid course id for students
   * @returns List of students for a course
   */
  async fetchStudentsForClass(cid: number): Promise<Student[]> {
    const { data, error } = await this.supabase.rpc('get_students', {
      cid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchStudentsforNewClass');
    }
    return data;
  }

  /**
   * update student grader status (toggle)
   * @param sid student ID
   * @param cid course ID
   */
  async updateGrader(sid: number, cid: number): Promise<void> {
    const { data, error } = await this.supabase.rpc('update_grader', {
      sid,
      cid,
    });

    if (error) {
      console.log(error);
      throw new Error('UpdateGrader');
    }
    console.log({ data });
  }

  /**
   * deletes student from course
   * @param sid student id
   * @param cid course id
   * @returns 1 if successful
   */
  async deleteStudentFromCourse(sid: number, cid: number): Promise<number> {
    let { data, error } = await this.supabase.rpc(
      'delete_student_from_course',
      {
        sid,
        cid,
      }
    );

    if (error) {
      console.log(error);
      throw new Error('deleteStudentFromCourse: ');
    }
    return data;
  }

  /**
   * Writes new assignment to database
   * @param cid course id from UI
   * @param assignment_name name of assignment
   */
  async insertNewAssignment(
    cid: number,
    assignment_name: string
  ): Promise<void> {
    const { data, error } = await this.supabase.rpc('insert_new_assignment', {
      cid,
      assignment_name,
    });
    if (error) {
      console.log(error);
      throw new Error('insert_new_assignment');
    }
    console.log({ data });
  }

  /**
   * insert student users into course (only if student is a registered user)
   * @param email student's email
   * @param cid course id
   * @param isGrader grader status
   * @returns 1 of insert is successful
   */
  async insertStudentCourse(
    student_email: string,
    cid: number,
    is_grader: boolean
  ): Promise<number> {
    let { data, error } = await this.supabase.rpc('insert_user', {
      student_email,
      cid,
      is_grader,
    });

    if (error) {
      console.log(error);
      throw new Error('insert student to course: ');
    }
    return data;
  }

  /**
   * Writes new assignment to database
   * @param cid course id from UI
   * @param assignment_name name of assignment
   */
  async deleteAssignment(aid: number): Promise<void> {
    const { data, error } = await this.supabase.rpc('delete_assignment', {
      aid,
    });
    if (error) {
      console.log(error);
      throw new Error('delete_assignment');
    }
    console.log({ data });
  }

  // async insertStudentToCourse(
  //   student_email: string,
  //   cid: number
  // ): Promise<number> {
  //   const { data, error } = await this.supabase.rpc('student_is_user', {
  //     student_email,
  //   });

  //   if (error) {
  //     console.log(error);
  //     throw new Error('insert student to course: ');
  //   }

  //   if (data) {
  //     const { data, error } = await this.supabase.rpc(
  //       'insert_student_to_course',
  //       {
  //         student_email,
  //         cid,
  //       }
  //     );
  //     if (error) {
  //       console.log(error);
  //       throw new Error('insert student to course: ');
  //     }
  //     return data;
  //   } else {
  //     const { data, error } = await this.supabase.auth.signInWithOtp({
  //       email: student_email,
  //       options: {},
  //     });
  //     if (error) {
  //       console.log(error);
  //       throw new Error('insert student to course: ');
  //     }
  //   }
  // }
  /**
   * fetch from supabase: professor appeals
   * @param pid professor id (later replaced with auth.id)
   * @returns courses the prof is teaching in JSON format
   */
  async fetchProfessorTemplates(pid: string): Promise<ProfessorTemplate[]> {
    const { data, error } = await this.supabase.rpc('get_professor_templates', {
      pid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchProfessorTemplates');
    }
    return data;
  }
}

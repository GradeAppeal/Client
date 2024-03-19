import { Injectable } from '@angular/core';
import { Session, SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import {
  StudentAppeal,
  StudentCourse,
} from '../shared/interfaces/student.interface';
import { Course, Assignment } from '../shared/interfaces/psql.interface';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private supabase: SupabaseClient;
  session: Session | null = null;

  constructor(private authService: AuthService) {
    this.supabase = this.authService.client;
    this.session = this.authService.session;
  }

  /**
   * Fetches the student's courses (both enrolled and grading)
   * @param sid student id
   * @returns
   */
  async fetchStudentCourses(sid: string): Promise<StudentCourse[]> {
    const { data, error } = await this.supabase.rpc('get_student_courses', {
      sid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchStudentCourses');
    }
    return data;
  }

  /**
   * Get single course with id of cid
   * @param sid student id
   * @param cid course id
   * @returns single course
   */
  async getStudentCourse(sid: string, cid: number): Promise<StudentCourse[]> {
    const { data, error } = await this.supabase.rpc('get_student_course', {
      sid,
      cid,
    });
    if (error) {
      console.log(error);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Fetches the student's courses (both enrolled and grading)
   * @param sid student id
   * @returns
   */
  async fetchGraderCourses(sid: string): Promise<StudentCourse[]> {
    const { data, error } = await this.supabase.rpc('get_grader_courses', {
      sid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchStudentCourses');
    }
    return data;
  }

  /**
   *
   * @param sid student id
   * @returns All the appeals made by the student
   */
  async fetchStudentAppeals(sid: string): Promise<StudentAppeal[]> {
    const { data, error } = await this.supabase.rpc('get_student_appeals', {
      sid,
    });

    if (error) {
      console.log(error);
      throw new Error('fetchStudentAppeals');
    }
    return data;
  }

  /**
   * Fetch course information for new appeal
   * @param cid course id for appeal
   * @returns The course of the assignment the student is making an appeal for
   */
  async fetchCourseForNewAppeal(cid: number): Promise<Course> {
    const { data, error } = await this.supabase.rpc('get_course', {
      cid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchCourseForNewAppeal');
    }
    return data[0];
  }

  async getCourseProfessor(cid: number): Promise<string> {
    const { data, error } = await this.supabase.rpc('get_course_professor', {
      cid,
    });

    if (error) {
      console.log(error);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Writes student appeal to database
   * @param aid assignment id from UI
   * @param sid student id from auth
   * @param cid course id from UI
   * @param created_at date & time of appeal submission
   * @param appeal_text student appeal
   * @param grade student grade
   */
  async insertNewAppeal(
    aid: number,
    sid: string,
    cid: number,
    gid: string | null,
    gname: string | null,
    created_at: Date,
    appeal_text: string,
    pid: string,
    has_image: boolean
  ): Promise<number> {
    const { data, error } = await this.supabase.rpc('insert_appeal', {
      aid,
      sid,
      cid,
      gid,
      gname,
      created_at,
      appeal_text,
      pid,
      has_image,
    });

    if (error) {
      console.log(error.hint);
      throw new Error(error.message);
    }
    return data;
  }
  /**
   * Fetch assignments for a particular course
   * @param cid course id for appeal
   * @returns List of assignments for a course
   */
  async fetchAssignmentsForNewAppeal(cid: number): Promise<Assignment[]> {
    const { data, error } = await this.supabase.rpc('get_assignments', {
      cid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchAssignmentsForNewAppeal');
    }
    return data;
  }
}

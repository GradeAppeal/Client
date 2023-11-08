import { Injectable } from '@angular/core';
import { AuthSession, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './auth.service';
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
  session: AuthSession | null = null;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.client;
    this.session = this.supabaseService.session;
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
    console.log('fetchStudentCourses from student.service.ts');
    console.log(data);
    return data;
  }

  /**
   *
   * @param sid student id
   * @returns All the appeals made by the student
   */
  async fetchStudentAppeals(sid: string): Promise<StudentAppeal[]> {
    console.log({ sid }, 'From fetchStudentappeals');
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
    created_at: Date,
    appeal_text: string
  ): Promise<number> {
    console.log();
    const { data, error } = await this.supabase.rpc('insert_appeal', {
      aid,
      sid,
      cid,
      created_at,
      appeal_text,
    });

    if (error) {
      console.log(error);
      throw new Error('insertNewAppeal');
    }
    console.log({ data });
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

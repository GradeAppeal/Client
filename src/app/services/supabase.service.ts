import { Injectable } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import {
  StudentCourse,
  StudentAppeal,
} from '../shared/interfaces/student.interface';
import {
  ProfessorCourse,
  ProfessorAppeal,
} from '../shared/interfaces/professor.interface';
import {
  Course,
  Assignment,
  Message,
  Student,
} from '../shared/interfaces/psql.interface';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  _session: AuthSession | null = null;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session;
    });
    return this._session;
  }

  authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  signIn(email: string) {
    return this.supabase.auth.signInWithOtp({ email });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  /**
   * Fetches the student's courses (both enrolled and grading)
   * @param sid student id
   * @returns
   */
  async fetchStudentCourses(sid: number): Promise<StudentCourse[]> {
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
   * fetch from supabase: professor courses
   * @param pid professor id (later replaced with auth.id)
   * @returns courses the prof is teaching in JSON format
   */
  async fetchProfessorCourses(pid: number): Promise<ProfessorCourse[]> {
    const { data, error } = await this.supabase.rpc('get_professor_courses', {
      pid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchProfessorCourses');
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
   * fetch from supabase: professor appeals
   * @param pid professor id (later replaced with auth.id)
   * @returns courses the prof is teaching in JSON format
   */
  async fetchProfessorAppeals(pid: number): Promise<ProfessorAppeal[]> {
    const { data, error } = await this.supabase.rpc(
      'get_professor_appeals_with_grade',
      {
        pid,
      }
    );
    if (error) {
      console.log(error);
      throw new Error('Error in fetchProfessorAppeals');
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
    sid: number,
    cid: number,
    created_at: Date,
    appeal_text: string,
    grade: number
  ): Promise<void> {
    const { data, error } = await this.supabase.rpc('insert_new_appeal', {
      aid,
      appeal_text,
      cid,
      created_at,
      sid,
      grade,
    });

    if (error) {
      console.log(error);
      throw new Error('insertNewAppeal');
    }
    console.log({ data });
  }

  async fetchMessages(aid: number): Promise<Message[]> {
    const { data, error } = await this.supabase.rpc('get_messages', {
      aid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchMessages');
    }
    return data;
  }

  /**
   * Inserts interaction history to supabase
   * @param appid appeal id
   * @param sender_id sender id--depends on student/prof mode
   * @param recipient_id recipient id--depends on student/prof mode
   * @param created_at timestamp
   * @param message_text text
   * @param from_grader boolean: grader or not
   * @returns 1 if insert was successful, 0 otherwise
   */
  async insertMessages(
    appid: number,
    sender_id: number,
    recipient_id: number,
    created_at: Date,
    message_text: string,
    from_grader: boolean
  ): Promise<number> {
    const { data, error } = await this.supabase.rpc('insert_message', {
      appid,
      created_at,
      from_grader,
      message_text,
      recipient_id,
      sender_id,
    });

    if (error) {
      console.log(error);
      throw new Error('insert messages');
    }
    return data;
  }

  async getUserId(id: number, type: 'student' | 'professor'): Promise<number> {
    const input = type == 'student' ? { sid: id } : { pid: id };
    const { data, error } = await this.supabase.rpc(
      `get_${type}_user_id`,
      input
    );
    if (error) {
      console.log(error);
      throw new Error('getUserId:');
    }
    return data;
  }

  /**
   * Insert new user as a student
   * @param firstName
   * @param lastName
   * @param email
   * @returns trigger insert student
   */
  async insertStudent(firstName: string, lastName: string, email: string) {
    const type = 'student';
    let { data, error } = await this.supabase.rpc('insert_user', {
      type,
      firstName,
      lastName,
      email,
    });

    if (error) {
      console.log(error);
      throw new Error('insert student: ');
    }
    return data;
  }

  /**
   * Insert new user as a professor
   * @param firstName
   * @param lastName
   * @param email
   * @returns trigger insert professor
   */
  async insertProfessor(firstName: string, lastName: string, email: string) {
    const type = 'professor';
    let { data, error } = await this.supabase.rpc('insert_user', {
      type,
      firstName,
      lastName,
      email,
    });

    if (error) {
      console.log(error);
      throw new Error('insert professor: ');
    }
    return data;
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
   * toggles grader status
   * @param sid student id
   * @param cid course id
   * @returns 1 if update was successful
   */
  async updateCourseGrader(sid: number, cid: number): Promise<number> {
    let { data, error } = await this.supabase.rpc('update_grader', {
      sid,
      cid,
    });

    if (error) {
      console.log(error);
      throw new Error('updateCourseGrader: ');
    }
    return data;
  }

  /**
   * Writes student appeal to database
   * @param type student or professor
   * @param first_name first name
   * @param last_name last name
   * @param email user's email prefix (no @calvin.edu)
   */
  async insertUser(
    type: string,
    first_name: string,
    last_name: string,
    email: string
  ): Promise<void> {
    const { data, error } = await this.supabase.rpc('insert_user', {
      type,
      first_name,
      last_name,
      email,
    });

    if (error) {
      console.log(error);
      throw new Error('insertUser');
    }
    console.log({ data });
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
   *
   * @param sid student id
   * @returns All the appeals made by the student
   */
  async fetchStudentAppeals(sid: number): Promise<StudentAppeal[]> {
    const { data, error } = await this.supabase.rpc('get_student_appeals', {
      sid,
    });

    if (error) {
      console.log(error);
      throw new Error('UpdateGrader');
    }
    return data;
  }
}

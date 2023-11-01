import { Injectable } from '@angular/core';
import { AuthSession, SupabaseClient, User } from '@supabase/supabase-js';
import { SupabaseService } from './auth.service';
import { Course, Student } from 'src/app/shared/interfaces/psql.interface';
import {
  ProfessorAppeal,
  ProfessorTemplate,
  ParsedStudent,
} from '../shared/interfaces/professor.interface';
import { StudentCourse } from '../shared/interfaces/student.interface';

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
   * @returns deleted StudentCourse row
   */
  async deleteStudentFromCourse(
    sid: number,
    cid: number
  ): Promise<StudentCourse> {
    let { data, error } = await this.supabase.rpc('delete_student', {
      sid,
      cid,
    });

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

  /**
   * Checks if a student is an authenticated user
   * @param student_email email of student to add
   * @returns true if student has an account, false otherwise
   */
  async isUser(student_email: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('is_student_user', {
      student_email,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in isUser');
    }
    console.log({ data });
    return data;
  }

  /**
   * Checks if students are auth users
   * @param parsedStudentsToAdd
   * @returns array of booleans once resolved
   */
  async fetchStudentUserStatus(
    parsedStudentsToAdd: ParsedStudent[]
  ): Promise<boolean[]> {
    try {
      const userStatus = await Promise.all(
        parsedStudentsToAdd.map(async (student) => {
          const isUser = await this.isUser(student.email);
          return isUser;
        })
      );
      console.log({ userStatus });
      return userStatus;
    } catch (err) {
      console.log(err);
      throw new Error('getStudentUserStatus');
    }
  }

  /**
   *
   * @param parsedStudent Student to add
   * @param cid Course to add student to
   * @returns 0/1 based on db insert success
   */
  async insertStudent(sid: string, cid: number): Promise<0 | 1> {
    // data: 0 if failure; 1 if success
    const { data, error } = await this.supabase.rpc('insert_student', {
      sid,
      cid,
    });
    if (error) {
      console.log({ error });
      throw new Error('InsertStudent');
    }
    return data;
  }

  /**
   *
   * @param studentIds list of student uuids
   * @param cid course to add students
   * @returns array of 0s and 1s indicating insert success/failure
   */
  async insertStudentsToCourse(
    studentIds: (string | null)[],
    cid: number
  ): Promise<(0 | 1)[]> {
    try {
      return await Promise.all(
        studentIds.map(async (sid) => {
          return sid ? await this.insertStudent(sid, cid) : 0;
        })
      );
    } catch (err) {
      console.log(err);
      throw new Error('insertStudentsToCourse');
    }
  }

  /**
   * Create(invite) a non-existent student user
   * @param parsedStudent Stduent to invite
   * @returns the user ID of newly created student user
   */
  async inviteStudent(parsedStudent: ParsedStudent): Promise<User | null> {
    const { first_name, last_name, email } = parsedStudent;
    // get user field of supabase.User type
    const {
      data: { user },
      error,
    } = await this.supabase.auth.admin.inviteUserByEmail(email, {
      data: { first_name, last_name },
    });
    // user fails to create: return null
    if (error) {
      console.log({ error });
      return null;
    }
    // user created: return the User object
    console.log({ user });
    return user;
  }

  /**
   * Create(invite) multiple users and store their user ids in an array
   * @param parsedStudentstoInvite List of students to invite
   * @returns list of new student ids or null is user failed to create
   */
  async inviteStudentsToCourse(
    parsedStudentstoInvite: ParsedStudent[]
  ): Promise<(string | null)[]> {
    try {
      const newStudentIds = await Promise.all(
        // create a user every non-registered student
        parsedStudentstoInvite.map(async (student) => {
          const user = await this.inviteStudent(student);
          return user ? user.id : null;
        })
      );
      console.log({ newStudentIds });
      return newStudentIds;
    } catch (err) {
      console.log(err);
      throw new Error('insertStudentsToCourse');
    }
  }
  /**
   * Get auth id of existing student user
   * @param parsedStudent Student to add to course
   * @returns student auth id
   */
  async fetchStudentId(parsedStudent: ParsedStudent): Promise<string | null> {
    const { email } = parsedStudent;
    const { data, error } = await this.supabase.rpc('get_student_id', {
      student_email: email,
    });
    if (error) {
      console.log({ error });
      return null;
    }
    return data;
  }

  /**
   * Get list of auth ids of existing student users
   * @param parsedStudents List of existing student users
   * @returns list of existing student auth ids
   */
  async fetchStudentIds(
    parsedStudents: ParsedStudent[]
  ): Promise<(string | null)[]> {
    try {
      const studentIds = await Promise.all(
        // create a user every non-registered student
        parsedStudents.map(async (student) => {
          const studentId = await this.fetchStudentId(student);
          return studentId;
        })
      );
      console.log({ studentIds });
      return studentIds;
    } catch (err) {
      console.log(err);
      throw new Error('fetchStudentIds');
    }
  }
  /**
   * Writes new assignment to database
   * @param pid professor id
   * @param assignment_name name of assignment
   */
  async insertTemplate(
    pid: number,
    temp_name: string,
    temp_text: string
  ): Promise<void> {
    const { data, error } = await this.supabase.rpc('insert_template', {
      pid,
      temp_name,
      temp_text,
    });
    if (error) {
      console.log(error);
      throw new Error('insert_template');
    }
    console.log(data);
  }

  /**
   * Delete template from database
   * @param tid template id
   */
  async deleteTemplate(tid: number): Promise<void> {
    const { data, error } = await this.supabase.rpc('delete_template', {
      tid,
    });
    if (error) {
      console.log(error);
      throw new Error('deleteTemplate');
    }
    console.log({ data });
  }
}

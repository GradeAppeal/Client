import { Injectable } from '@angular/core';
import { AuthSession, SupabaseClient, User } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import {
  Course,
  Student,
  StudentCourse,
} from 'src/app/shared/interfaces/psql.interface';
import {
  ProfessorAppeal,
  ProfessorTemplate,
  ParsedStudent,
  StudentCourseGraderInfo,
  Roster,
} from 'src/app/shared/interfaces/professor.interface';
import { BehaviorSubject, Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfessorService {
  private supabase: SupabaseClient;
  session: AuthSession | null = null;
  dialog: any;
  $openProfessorAppeals = new BehaviorSubject<
    ProfessorAppeal[] | null | undefined
  >(undefined);

  constructor(private AuthService: AuthService) {
    this.supabase = this.AuthService.client;
    this.session = this.AuthService.session;
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
   * Writes new assignment to database
    @param pid professor id from auth
    @param prefix course prefix
    @param code course code
    @param name course name
    @param section course section
    @param semester course semester
    @param year course year
   */
  async insertCourse(
    pid: string,
    prefix: string,
    code: number,
    name: string,
    section: string,
    semester: string,
    year: number
  ): Promise<void> {
    const { data, error } = await this.supabase.rpc('insert_course', {
      pid,
      prefix,
      code,
      name,
      section,
      semester,
      year,
    });
    if (error) {
      console.log(error);
      throw new Error('insert_course');
    }
    return data;
  }

  /**
   * delete course
   * @param cid course id
   * @returns deleted StudentCourse row
   */
  async deleteCourse(cid: number, pid: string): Promise<void> {
    let { data, error } = await this.supabase.rpc('delete_course', {
      cid,
      pid,
    });
    if (error) {
      console.log(error);
      throw new Error('deleteCourse');
    }
  }

  async getNewProfessorAppeal(aid: number): Promise<ProfessorAppeal[]> {
    const { data, error } = await this.supabase.rpc(
      'get_new_professor_appeal',
      {
        aid,
      }
    );
    if (error) {
      console.log(error);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * fetch from supabase: OPEN professor appeals
   * @param pid professor id (later replaced with auth.id)
   * @returns courses the prof is teaching in JSON format
   */
  async fetchOpenProfessorAppeals(pid: string): Promise<ProfessorAppeal[]> {
    const { data, error } = await this.supabase.rpc(
      'get_open_professor_appeals',
      {
        pid,
      }
    );
    if (error) {
      console.log(error);
      throw new Error('fetchOpenProfessorAppeals');
    }
    return data;
  }

  /**
   * fetch from supabase: CLOSED professor appeals
   * @param pid professor id (later replaced with auth.id)
   * @returns courses the prof is teaching in JSON format
   */
  async fetchClosedProfessorAppeals(pid: string): Promise<ProfessorAppeal[]> {
    const { data, error } = await this.supabase.rpc(
      'get_closed_professor_appeals',
      {
        pid,
      }
    );
    if (error) {
      console.log(error);
      throw new Error('fetchClosedProfessorAppeals');
    }
    return data;
  }

  /**
   * fetch from supabase: ALL professor appeals
   * @param pid professor id (later replaced with auth.id)
   * @returns courses the prof is teaching in JSON format
   */
  async fetchAllProfessorAppeals(pid: string): Promise<ProfessorAppeal[]> {
    const { data, error } = await this.supabase.rpc(
      'get_all_professor_appeals',
      {
        pid,
      }
    );
    if (error) {
      console.log(error);
      throw new Error('fetchAllProfessorAppeals');
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
   * @param cid course id
   * @returns List of students for a course
   */
  async fetchCourseStudents(cid: number): Promise<StudentCourseGraderInfo[]> {
    const { data, error } = await this.supabase.rpc('get_course_students', {
      cid,
    });
    if (error) {
      console.log(error);
      throw new Error('fetchCourseStudents');
    }
    return data;
  }

  async getCourseRoster(cid: number): Promise<Roster> {
    const { data, error } = await this.supabase.rpc('get_course_roster', {
      cid,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * update student grader status (toggle)
   * @param sid student ID
   * @param cid course ID
   */
  async updateGrader(sid: string, cid: number): Promise<void> {
    const { data, error } = await this.supabase.rpc('update_grader', {
      sid,
      cid,
    });

    if (error) {
      console.log(error);
      throw new Error('UpdateGrader');
    }
  }

  /**
   * deletes student from course
   * @param sid student id
   * @param cid course id
   * @returns deleted StudentCourse row
   */
  async deleteStudentFromCourse(
    sid: string,
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
    return data[0];
  }

  /**
   * Writes new assignment to database
   * @param cid course id from UI
   * @param assignment_name name of assignment
   * @param gid grader ID
   * @param gname grader name
   */
  async insertNewAssignment(
    cid: number,
    assignment_name: string,
    gid: string | null,
    gname: string | null
  ): Promise<void> {
    console.log({ gid }, { gname });
    const { data, error } = await this.supabase.rpc('insert_assignment', {
      cid,
      assignment_name,
      gid,
      gname,
    });
    if (error) {
      console.log(error);
      throw new Error('insert_new_assignment');
    }
  }

  /**
   * Writes new assignment to database
   * @param aid assignment id
   */
  async deleteAssignment(aid: number): Promise<void> {
    const { data, error } = await this.supabase.rpc('delete_assignment', {
      aid,
    });
    if (error) {
      console.log(error);
      throw new Error('delete_assignment');
    }
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
      throw new Error(error.message);
    }
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
    const { data, error } = await this.supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: { first_name, last_name },
      }
    );

    // user fails to create: return null
    if (error) {
      console.log({ error });
      return null;
    }
    // user created: return the User object
    return data.user;
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
      const newStudents = await Promise.all(
        // create a user every non-registered student
        parsedStudentstoInvite.map(async (student) => {
          await this.inviteStudent(student);
          return student;
        })
      );
      const newStudentIds = await this.fetchStudentIds(newStudents);
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
      return studentIds;
    } catch (err) {
      console.log(err);
      throw new Error('fetchStudentIds');
    }
  }

  /**
   * Insert template to database
   * @param pid professor id
   * @param temp_name template name
   * @param temp_text template text
   */
  async insertTemplate(
    pid: string,
    temp_name: string,
    temp_text: string
  ): Promise<void> {
    const { data, error } = await this.supabase.rpc('insert_template', {
      pid,
      temp_name,
      temp_text,
    });
    if (error) {
      throw new Error(error.message);
    }
  }
  /**
   * Insert template to database
   * @param tid template id
   * @param pid professor id
   * @param temp_name template name
   * @param temp_text template text
   */
  async updateTemplate(
    tid: number,
    pid: string,
    tname: string,
    new_temp_text: string
  ): Promise<void> {
    const { data, error } = await this.supabase.rpc('update_template', {
      tid,
      pid,
      tname,
      new_temp_text,
    });
    if (error) {
      throw new Error(error.message);
    }
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
  }

  /**
   * Open or close appeals
   * @param aid appeal id
   */
  async updateAppealOpenStatus(aid: number): Promise<number> {
    const { data, error } = await this.supabase.rpc(
      'update_appeal_open_status',
      {
        aid,
      }
    );
    if (error) {
      console.log(error);
      throw new Error('updateAppealOpenStatus');
    }
    return data;
  }

  /**
   * Get all the graders for the course
   * @param cid course id
   * @returns List of student graders
   */
  async getGraders(cid: number): Promise<StudentCourseGraderInfo[]> {
    const { data, error } = await this.supabase.rpc('get_graders', {
      cid,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async updateAssignmentGrader(aid: number, gid: string, gname: string) {
    const { data, error } = await this.supabase.rpc(
      'update_assignment_grader',
      {
        aid,
        gid,
        gname,
      }
    );
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Assigns a grader to an appeal
   * @param aid appeal id
   * @param gid grader id to assign to appeal
   * @param gname grader name
   * @returns updated appeal id
   */
  async updateAppealGrader(
    aid: number,
    gid: string,
    gname: string
  ): Promise<string> {
    const { data, error } = await this.supabase.rpc('update_appeal_grader', {
      aid,
      gid,
      gname,
    });
    if (error) {
      console.log(error);
      throw new Error('updateAppealGrader');
    }
    return data;
  }

  /**
   * Deletes appeals from supabase
   * @param aid appeal ID
   * @returns The id of deleted appeal
   */
  async deleteAppeal(aid: number): Promise<number> {
    const { data, error } = await this.supabase.rpc('delete_appeal', {
      aid,
    });
    if (error) {
      console.log(error);
      throw new Error(error.message);
    }
    return aid;
  }
  /**
   * Assigns a grader to an appeal
   * @param aid appeal id
   * @param gid grader id to assign to appeal
   * @param gname grader name
   * @returns updated appeal id
   */
  async updateUnassignAppealGrader(aid: number): Promise<void> {
    const { data, error } = await this.supabase.rpc(
      'update_unassign_appeal_grader',
      {
        aid,
      }
    );
    if (error) {
      console.log(error);
      throw new Error('updateUnassignAppealGrader');
    }
  }

  /**
   * Professors can update students' passwords
   * This is a backup method for when student's cannot receive emails from Supabase
   * @param sid student id
   * @param password student password
   * @returns user information
   */
  async updateStudentPassword(
    sid: string,
    password: string
  ): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.admin.updateUserById(sid, { password });
    if (error) {
      throw new Error(error.message);
    }
    return user;
  }

  async getStudentInfo(sid: string): Promise<string | undefined | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.admin.getUserById(sid);
    if (error) {
      throw new Error(error.message);
    }

    return user?.confirmed_at;
  }

  /**
   * Professor can verify student's account if he/she does not receive invitation email
   * @param sid student ID
   * @returns student user
   */
  async verifyStudent(sid: string) {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.admin.updateUserById(sid, {
      email_confirm: true,
    });
    if (error) {
      throw new Error(error.message);
    }
    return user;
  }

  /**
   * Get Professor's cron job
   * @param pid professor ID
   * @returns cron job in string format (e.g. "0 8 * * 1")
   */
  async getCron(pid: string): Promise<string> {
    const { data, error } = await this.supabase.rpc('get_cron', {
      pid,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async updateCron(pid: string, cron: string): Promise<void> {
    const { data, error } = await this.supabase.rpc('update_cron', {
      pid,
      cron,
    });
    if (error) {
      throw new Error(error.message);
    }
  }
}

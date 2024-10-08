import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { UserService } from "src/app/service/user.service";
import { beginLogin, beginRegister, duplicateUser, duplicateUserSuccess, fetchmenu, fetchmenusuccess, getroles, getrolesuccess, getuserbycode, getuserbycodesuccess, getusers, getusersuccess, updateuserrole } from "./User.action";
import { catchError, exhaustMap, map, of, switchMap } from "rxjs";
import { showalert } from "../Common/App.Action";
import { Router } from "@angular/router";
import { Userinfo } from "../Model/User.model";

@Injectable()
export class UserEffect {
    constructor(private action$: Actions, private service: UserService, private route: Router) { }

    _userregister = createEffect(() =>
        this.action$.pipe(
            ofType(beginRegister),
            exhaustMap((action) => {
                return this.service.UserRegistration(action.userdata).pipe(
                    map(() => {

                        this.route.navigate(['login'])
                        return showalert({ message: 'Registered as Successfully.', resulttype: 'pass' })
                    }),
                    catchError((_error) => of(showalert({ message: 'Registered as Failed due to:.' + _error.message, resulttype: 'fail' })))
                )
            })
        ))

    _userlogin = createEffect(() =>
        this.action$.pipe(
            ofType(beginLogin),
            switchMap((action) => {
                return this.service.UserLogin(action.usercred).pipe(
                    switchMap((data: Userinfo[]) => {

                        if (data.length > 0) {
                            const _userdata = data[0];
                            if (_userdata.status === true) {
                                this.service.SetUserToLocalStorage(_userdata);
                                this.route.navigate([''])
                                return of( fetchmenu({userrole: _userdata.role}), showalert({ message: 'Login as Success.', resulttype: 'pass' }))
                            } else {
                                return of(showalert({ message: 'Inactive User.', resulttype: 'fail' }))
                            }
                        } else {
                            return of(showalert({ message: 'Login Failed: Invalid credentials.', resulttype: 'fail' }))
                        }
                    }),
                    catchError((_error) => of(showalert({ message: 'Login as Failed due to:.' + _error.message, resulttype: 'fail' })))
                )
            })
        ))



        _duplicateuser = createEffect(() =>
            this.action$.pipe(
                ofType(duplicateUser),
                switchMap((action) => {
                    return this.service.Duplicateusername(action.username).pipe(
                        switchMap((data) => {
                            if (data.length > 0){
                                return of (duplicateUserSuccess({isduplicate: true}),
                            showalert({message: 'Username Already Exist.', resulttype: 'fail'}))
                            }else{
                                return of (duplicateUserSuccess({isduplicate:false}))
                            }
                        }),
                        catchError((_error) => of (showalert({message: 'Registration failed due to:.' + _error.message, resulttype: 'fail'})))
                    )
                })
            ))

    _loadmenubyrole = createEffect(() =>
        this.action$.pipe(
            ofType(fetchmenu),
            exhaustMap((action) => {
                return this.service.GetMenuByRole(action.userrole).pipe(
                    map((data) => {
                        return fetchmenusuccess({menulist:data})
                    }),
                    catchError((_error) => of(showalert({ message: 'Failed to fetch menu list.' , resulttype: 'fail' })))
                )
            })
        ))

    _getallusers = createEffect(() =>
        this.action$.pipe(
            ofType(getusers),
            exhaustMap((action) => {
                return this.service.GetAllUsers().pipe(
                    map((data) => {
                        return getusersuccess({ userlist: data })
                    }),
                    catchError((_error) => of(showalert({ message: 'Failed to fetch user list.', resulttype: 'fail' })))
                )
            })
        )
    )


    _getallRoles = createEffect(() =>
        this.action$.pipe(
            ofType(getroles),
            exhaustMap((action) => {
                return this.service.GetAllRoles().pipe(
                    map((data) => {
                        return getrolesuccess({ rolelist: data })
                    }),
                    catchError((_error) => of(showalert({ message: 'Failed to fetch role list.', resulttype: 'fail' })))
                )
            })
        )
    )


    _getuserbycode = createEffect(() =>
        this.action$.pipe(
            ofType(getuserbycode),
            switchMap((action) => {
                return this.service.Duplicateusername(action.username).pipe(
                    switchMap((data) => {
                        if (data.length > 0){
                            return of (getuserbycodesuccess({userinfo: data[0]}))
                    
                        }else{
                            return of (duplicateUserSuccess({isduplicate:false}))
                        }
                    }),
                    catchError((_error) => of (showalert({message: 'get user by code failed due to:.' + _error.message, resulttype: 'fail'})))
                )
            })
        )
    )

    _assignrole = createEffect(() =>
        this.action$.pipe(
            ofType(updateuserrole),
            switchMap((action) => {
                return this.service.UpdateUser(action.userid, action.userrole).pipe(
                    switchMap(() => {

                        return of(getusers(), showalert({ message: 'Updated Successfully', resulttype: 'pass' }))


                    }),
                    catchError((_error) => of(showalert({ message: 'get user by code failed due to:.' + _error.message, resulttype: 'fail' })))
                )
            })
        )
    )
}
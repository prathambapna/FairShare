import React, { Fragment,useEffect } from 'react'
import MetaData from '../layout/MetaData'
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../layout/Loader/Loader';
import {useNavigate} from "react-router-dom";
import "./Profile.css"

export const Profile = () => {

    const {user,isAuthenticated,loading}=useSelector((state)=>state.user);
    const navigate=useNavigate();

    const deleteAvatarHandler=(e)=>{
        e.preventDefault();
        const isConfirmed = window.confirm('Are you sure you want to remove Profile Picture?');

        if (isConfirmed) {
            navigate(`/me/removeAvatar`);
        }
    }

    const editProfileHandler=(e)=>{
        e.preventDefault();
        navigate(`/me/update`);
    }

    useEffect(() => {
      if(isAuthenticated===false){
        navigate("/login");
      }
    }, [navigate,isAuthenticated,user])
    
    return (
        <Fragment>
            {loading===true?(<Loader />) :
                (<Fragment>
                    <MetaData title={ `${user.name}'s Profile`}/>
                    <div className="profileContainer">
                        <div>
                            <h1>My Profile</h1>
                            <img src={(user.avatar && user.avatar.url && user.avatar.url!=="profile pic url") ? user.avatar.url:"/Profile.png"}
                                alt={user.name} />
                            <div>
                                <span onClick={(e) => editProfileHandler(e)}>
                                    Edit Profile
                                </span>
                                {user.avatar && user.avatar.url && user.avatar.url !== "profile pic url" && (
                                    <span className="deleteProfileAvatar" onClick={(e) => deleteAvatarHandler(e)}>
                                         &nbsp;/ &nbsp;Remove Profile Picture
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                        <div>
                            <h4>Full Name</h4>
                            <p>{user.name}</p>
                        </div>
                        <div>
                            <h4>Email</h4>
                            <p>{user.email}</p>
                        </div>
                        <div>
                            <h4>Joined On</h4>
                            <p>{String(user.createdAt).substr(0, 10)}</p>
                        </div>

                        <div>
                            <Link to="/password/update">Change Password</Link>
                        </div>
                        </div>
                    </div>
                </Fragment>)}
        </Fragment>
    )
}


export default Profile;
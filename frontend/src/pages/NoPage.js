import { useMediaQuery, useTheme } from '@mui/material';
import React from 'react'
import { Navigate } from 'react-router-dom'

const NoPage = ({ user }) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <>
        {!user 
        ? ( <Navigate to='/login' /> )
        : <div style={{ position: 'fixed', top: '45%', left: '50%', transform: 'translate(-50%, -50%)'}}>404 NOT FOUND: There is no such Page</div>}
    </>
  )
}

export default NoPage
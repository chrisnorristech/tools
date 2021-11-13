CREATE DEFINER=`xxxx`@`localhost` PROCEDURE `checkAuth`(in p_userName varchar(500), in p_userTypeReq varchar(1), in p_userLevelReq varchar(1), p_software varchar(500))
BEGIN
	/*
	checkAuth - validates user with roles
	Developer: Christopher Norris @ KCED
	p_userName (string): user to validate
	p_userType (string): user Type to check against
	p_userLevel (string): user Level to check against
	returns: (integer): authorized (1) or not authorized (0)
	-------------------------------------------------
	2020-10-29 - CDN - initial development
	*/
	/* declare some variables */
	declare isAuth int;
	declare v_userType char(1);
	declare v_userLevel char(1);
	declare v_totalReq int;
	declare v_totalUser int;
	
    /* get user type and user level for username */
    select
			USRTYP, USRLEV into
            v_userType, v_userLevel
	from xxxxx where USERNAME = p_userName and SOFTWARE = p_software;
	
    /* get ascii values of type and level (both provided and required) */
    set v_totalUser = ascii(v_userType) + ascii(v_userLevel);
    set v_totalReq = ascii(p_userTypeReq) + ascii(p_userLevelReq);
    
    /* check to see if userType and userLevel meet or exceed requirement */
    if v_totalUser <= v_totalReq then
		set isAuth = 1;
	else
		set isAuth = 0;
	end if;
    
    /* return the auth value */
    select isAuth;
END

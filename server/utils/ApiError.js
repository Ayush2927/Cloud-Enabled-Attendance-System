class ApiError extends error{
    constructor(statusCode,message="Something went wrong",error=[]){
        super(message)

        this.statusCode=statusCode;
        this.data=null;
        this.message=message;
        this.success=false;
        this.errors=errors;

        Error.captureStackTrace(this,this.constructor)
    }
}

export {ApiError}
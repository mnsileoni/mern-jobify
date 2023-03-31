/** @format */
import Job from "../models/Job.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import checkPermissions from "../utils/checkPermissions.js";
import mongoose from "mongoose";
import moment from "moment";

const createJob = async (req, res) => {
  const { position, company } = req.body;

  if (!position || !company) {
    throw new BadRequestError("Please Provide All Values");
  }

  req.body.createdBy = req.user.userId;

  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;

  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new NotFoundError(`No job with id : ${jobId}`);
  }

  checkPermissions(req.user, job.createdBy);

  await job.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Success! Job removed" });
};

// Get all Jobs controller
const getAllJobs = async (req, res) => {
  const { search, status, jobType, sort = "latest first" } = req.query;
  // Al objeto queryObject agregaremos y sacaremos items que formen parte de la consulta defaz del acuerdo a lo que se ingrese en la interfaz del cliente.
  const queryObject = {
    createdBy: req.user.userId,
  };
  //solo si el campo status es diferente a 'all' se agrega al query. Es un campo de cuatro opciones, una es 'all'.
  if (status && status !== "all") {
    queryObject.status = status;
  }
  // con jobType pasa lo mismo que con status
  if (jobType && jobType !== "all") {
    queryObject.jobType = jobType;
  }
  // para buscar la posicion usamos los parametros $regex (busca un string dentro del campo.) y $options:'i' que indica Case Insensitive.  https://www.mongodb.com/docs/v6.0/reference/operator/query/regex/
  if (search) {
    queryObject.position = { $regex: search, $options: "i" };
  }
  // NO AWAIT
  let consultaDinamica = Job.find(queryObject);
  // chain sort conditions

  if (sort === "latest-first") {
    consultaDinamica = consultaDinamica.sort("-createdAt");
  }
  if (sort === "oldest-first") {
    consultaDinamica = consultaDinamica.sort("createdAt");
  }
  if (sort === "a->z") {
    consultaDinamica = consultaDinamica.sort("position");
  }
  if (sort === "z->a") {
    consultaDinamica = consultaDinamica.sort("-position");
  }

  // setup pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20; //NO ESTAMOS CONFIGURANDO LA POSIBILIDAD DE CAMBIAR LA CANTIDAD DE JOBS A MOSTRAR POR PAGINA. SE PUEDE HACER: INCORPORAR AL ESTADO UNA VARIABLE DE NOMBRE LIMIT QUE ESTABLECE ESTO Y PONERLA EN EL FORM
  const skip = (page - 1) * limit; //10
  consultaDinamica = consultaDinamica.skip(skip).limit(limit);

  const jobs = await consultaDinamica;
  // const jobs = await Job.find({ createdBy: req.user.userId });

  const totalJobs = await Job.countDocuments(queryObject);
  //totalJobs es el total de jobs que cumplen con el query
  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};

const updateJob = async (req, res) => {
  const { id: jobId } = req.params;
  const { company, position, status } = req.body;

  if (!company || !position) {
    throw new BadRequestError("UpdateJob: Please Provide All Values");
  }
  const job = await Job.findOne({ _id: jobId });
  if (!job) {
    throw new NotFoundError(`UpdateJob: No job with id ${jobId}`);
  }

  // check permissions
  console.log(typeof req.user.userId);
  console.log(typeof job.createdBy);
  checkPermissions(req.user, job.createdBy);

  const updatedJob = await Job.findOneAndUpdate({ _id: jobId }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({ updatedJob });
};

const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(req.user.userId),
      },
    },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  /*
showStats nos devuelve un array stats de esta forma:
"stats": [
        {
            "_id": "declined",
            "count": X
        },
        {
            "_id": "pending",
            "count": Y
        },
        {
            "_id": "interview",
            "count": Z
        }
    ]

    Con el reduce lo convertimos en un objeto así:

    "stats": {
    declined: X,
    pending: Y,
    interview: Z
    }

*/

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  // res.status(StatusCodes.OK).json({ stats });
  // en el caso que el usuario no tenga jobs en alguno de los estados lo completamos con cero.
  // Asi recibimos respuesta homogenea siempre.
  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };
  // monthlyApplications lo usaremos para distribuir la cantidad de aplicaciones cargadas por fecha en los ultimos meses. Lo iniciamos nulo.
  // let monthlyApplications = [];
  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: {
          year: {
            $year: "$createdAt",
          },
          month: {
            $month: "$createdAt",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);
  /*
La salida del query anterior tiene la siguiente forma:
"monthlyApplications": [
        {
            "_id": {
                "year": 2023,
                "month": 3
            },
            "count": 2
        },
        {
            "_id": {
                "year": 2023,
                "month": 2
            },
            "count": 1
        },
        {
            "_id": {
                "year": 2023,
                "month": 1
            },
            "count": 1
        },
        {
            "_id": {
                "year": 2022,
                "month": 12
            },
            "count": 2
        },
        {
            "_id": {
                "year": 2022,
                "month": 11
            },
            "count": 1
        },
        {
            "_id": {
                "year": 2022,
                "month": 10
            },
            "count": 3
        }
    ]

Con el mapeo siguiente se consigue esta forma:
"monthlyApplications": [
        {
            "date": "Oct 2022",
            "count": 3
        },
        {
            "date": "Nov 2022",
            "count": 1
        },
        {
            "date": "Dec 2022",
            "count": 2
        },
        {
            "date": "Jan 2023",
            "count": 1
        },
        {
            "date": "Feb 2023",
            "count": 1
        },
        {
            "date": "Mar 2023",
            "count": 2
        }
    ]
*/
  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      // accepts month 0-11
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM Y");
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

export { createJob, deleteJob, getAllJobs, updateJob, showStats };

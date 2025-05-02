import * as ServiceRoom from "./room.service.js"


export const AddRoomController = async (req, res, next) => {

    try {
        // console.log(req);

        const response = await ServiceRoom.addRoomService(req.body)
        res.status(200).send(response);

    } catch (error) {

        res.status(500).send({ error: 'error' });
    }

}


export const GetRoomController = async (req, res, next) => {

    try {
        // console.log(req);

        const response = await ServiceRoom.getRoomService()
        res.status(200).send(response);

    } catch (error) {

        res.status(500).send({ error: 'error' });
    }

}


export const UpdateRoomController = async (req, res, next) => {

    try {
        // console.log(req);

        const response = await ServiceRoom.updateRoomService(req.body)
        res.status(200).send(response);

    } catch (error) {

        res.status(500).send({ error: 'error' });
    }

}

export const DelectRoomeController = async (req, res, next) => {
    try {
      // console.log(req);
  
      const response = await ServiceRoom.deleteRoomService(req.body);
      res.status(200).send(response);
    } catch (error) {
      res.status(500).send({ error: "error" });
    }
  };
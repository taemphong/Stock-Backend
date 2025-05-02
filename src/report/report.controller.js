import * as ServiceReport from "./report.service.js"


export const reportroomwithdrawController = async (req, res, next) => {
    try {
        const response = await ServiceReport.getDatadashboardRoomService(req.body);
        res.status(200).send(response);
    } catch (error) {
        res.status(500).send({ error: "error" });
    }
}

export const ReportProductTypeController = async (req, res, next) => {
    
    try {

        const response = await ServiceReport.ReportProductType()
        res.status(200).send(response);

    } catch (error) {

        res.status(500).send({ error: 'error' });
    }
}

export const ReportController = async (req, res, next) => {

    try {

        const response = await ServiceReport.ReportAddProductService()
        res.status(200).send(response);

    } catch (error) {

        res.status(500).send({ error: 'error' });
    }

}

export const ReportReserveController = async (req, res, next) => {

    try {

        const response = await ServiceReport.ReportReserveProductService()
        res.status(200).send(response);

    } catch (error) {

        res.status(500).send({ error: 'error' });
    }

}

export const getMonthOfWidthdrawController = async (req, res, next) => {

    try {

        const response = await ServiceReport.getMonthOfWidthdrawService()
        res.status(200).send(response);

    } catch (error) {

        res.status(500).send({ error: 'error' });
    }

}
import React, { useEffect, useState } from 'react';
import { setTaskDialogOpen, setProjectFlag } from '../Redux/dataSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import TaskDialog from '../compoonents/TaskDialog';

const OverviewPage = ({
  addPayment,
  setAddPayment,
  interiorArray,
  salesAssociateArray,
  setNavState,
  projectData,
  status,
  setStatus,
  tasks,
  tailorsArray,
  setTailorsArray,
  goodsArray,
  setGoodsArray,
  projectDate,
  setPRojectDate,
  projects,
  paymentData
}) => {
  const dueAmount = projectData.totalAmount + projectData.totalTax - projectData.paid;
  const dispatch = useDispatch();
  const taskDialogOpen = useSelector((state) => state.data.taskDialogOpen);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [editing, setediting] = useState(null);

  const addNewTask = () => {
    dispatch(setTaskDialogOpen(true));
    navigate("/tasks");
  };

  const [pending, setPending] = useState(0);
  const [ordered, setOrdered] = useState(0);
  const [received, setReceived] = useState(0);
  const [instock, setInStock] = useState(0);
  const [tailorpending, setTailorPending] = useState(0);
  const [tailorordered, setTailorOrdered] = useState(0);
  const [tailorreceived, setTailorReceived] = useState(0);

  
    useEffect(() => {
      console.log(status)
    })

  useEffect(() => {
    let pendingCount = 0;
    let orderedCount = 0;
    let receivedCount = 0;
    let instockCount = 0;
    let tailorPendingCount = 0;
    let tailorOrderedCount = 0;
    let tailorReceivedCount = 0;

    goodsArray.forEach(item => {
      switch (item.status) {
        case "Pending":
          pendingCount++;
          break;
        case "Ordered":
          orderedCount++;
          break;
        case "Received":
          receivedCount++;
          break;
        case "In Stock":
          instockCount++;
          break;
        default:
          break;
      }
    });

    tailorsArray.forEach(tailor => {
      switch (tailor.status) {
        case "Pending":
          tailorPendingCount++;
          break;
        case "Ordered":
          tailorOrderedCount++;
          break;
        case "Received":
          tailorReceivedCount++;
          break;
        default:
          break;
      }
    });

    setPending(pendingCount);
    setOrdered(orderedCount);
    setReceived(receivedCount);
    setInStock(instockCount);
    setTailorPending(tailorPendingCount);
    setTailorOrdered(tailorOrderedCount);
    setTailorReceived(tailorReceivedCount);
  }, [goodsArray, tailorsArray]);

  const [paymentReceived, setPaymentReceived] = useState(0);

  useEffect(() => {
    if (!projectData?.projectName || !paymentData?.length) return;

    const total = paymentData
      .filter(payment => payment[1]?.toLowerCase() === projectData.projectName.toLowerCase())
      .reduce((sum, payment) => {
        const amount = parseFloat(payment[2]);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

    setPaymentReceived(total);
  }, [projectData.projectName, paymentData]);



  return (
    <div className="flex flex-col gap-2 sm:gap-4 p-2 sm:p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
        <p className="text-lg sm:text-xl md:text-2xl font-semibold">Project Name: {projectData.projectName}</p>
        <div className="flex items-center gap-1 sm:gap-2">
          <label className="text-sm sm:text-base">Delivery Date:</label>
          <input
            className="border border-gray-300 !rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
            type="date"
            value={projectDate}
            onChange={(e) => setPRojectDate(e.target.value)}
          />
        </div>
      </div>

      {/* Upper Section */}
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-4">
        {/* Client Info */}
        <div className="flex flex-col border !rounded-lg p-2 sm:p-4 w-full lg:w-1/3">
          <p className="text-base sm:text-lg md:text-xl font-medium mb-1 sm:mb-2">Client Information</p>
          <div className="flex flex-col gap-1 sm:gap-2 text-sm sm:text-base">
            <div className="flex justify-between">
              <p className="text-gray-500">Name</p>
              <p className="max-w-[50%] break-words">{projectData.customerLink[0]}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-500">Phone</p>
              <p className="max-w-[50%] break-words">{projectData.customerLink[1]}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-500">Alternate Phone</p>
              <p className="max-w-[50%] break-words">{projectData.customerLink[4]}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-500">Email</p>
              <p className="max-w-[50%] break-words">{projectData.customerLink[2]}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-500">Address</p>
              <p className="max-w-[50%] break-words">{projectData.customerLink[3]}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-500">Additional Requests</p>
              <p className="max-w-[50%] break-words">{projectData.additionalRequests}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col w-full lg:w-1/3 p-2 sm:p-4 border !rounded-lg">
          <p className="text-base sm:text-lg md:text-xl font-medium mb-1 sm:mb-2">Current Status</p>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-2 sm:mb-4">
            <p className="text-sm sm:text-base text-gray-500">Delivery & Installation</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 !rounded-md text-sm sm:text-base focus:ring-2 focus:ring-blue-400 w-full sm:w-auto"
            >
              <option value="Approved">Approved</option>
              <option value="Goods Pending">Goods Pending</option>
              <option value="Goods Complete">Goods Complete</option>
              <option value="Tailor Complete">Tailor Complete</option>
              <option value="Tailor Pending">Tailor Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex flex-col gap-1 sm:gap-2">
              <p className="text-sm sm:text-base font-semibold">Goods Ordered</p>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <p className="text-xs sm:text-sm !rounded-xl text-yellow-500 font-semibold bg-yellow-100 py-1 px-1 sm:px-2">Pending-{pending}</p>
                  <p className="text-xs sm:text-sm !rounded-xl text-sky-600 font-semibold bg-sky-100 py-1 px-1 sm:px-2">Ordered-{ordered}</p>
                  <p className="text-xs sm:text-sm !rounded-xl text-green-600 font-semibold bg-green-100 py-1 px-1 sm:px-2">Received-{received}</p>
                  <p className="text-xs sm:text-sm !rounded-xl text-green-600 font-semibold bg-green-100 py-1 px-1 sm:px-2">In Stock-{instock}</p>
                </div>
                <button
                  onClick={() => setNavState("Goods")}
                  className="text-sky-600 border border-sky-600 bg-white !rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-base hover:bg-sky-50 w-full sm:w-auto"
                >
                  View
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1 sm:gap-2">
              <p className="text-sm sm:text-base font-semibold">Goods Sent to Tailor</p>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <p className="text-xs sm:text-sm !rounded-xl text-yellow-500 font-semibold bg-yellow-100 py-1 px-1 sm:px-2">Pending-{tailorpending}</p>
                  <p className="text-xs sm:text-sm !rounded-xl text-sky-600 font-semibold bg-sky-100 py-1 px-1 sm:px-2">Ordered-{tailorordered}</p>
                  <p className="text-xs sm:text-sm !rounded-xl text-green-600 font-semibold bg-green-100 py-1 px-1 sm:px-2">Received-{tailorreceived}</p>
                </div>
                <button
                  onClick={() => setNavState("Tailors")}
                  className="text-sky-600 border border-sky-600 bg-white !rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-base hover:bg-sky-50 w-full sm:w-auto"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="flex flex-col w-full lg:w-1/3 p-2 sm:p-4 !rounded-lg border">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-4">
            <p className="text-base sm:text-lg md:text-xl font-medium">Payments</p>
            <div className="flex flex-row gap-1 sm:gap-2 mt-1 sm:mt-0">
              <button
                onClick={() => { setNavState("Payments"); setAddPayment(true)}}
                className="text-white bg-sky-600 !rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-base hover:bg-sky-700 w-full sm:w-auto"
              >
                Add
              </button>
              <button
                onClick={() => setNavState("Payments")}
                className="text-white bg-sky-600 !rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-base hover:bg-sky-700 w-full sm:w-auto"
              >
                View
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex flex-row justify-between items-center border !rounded-lg p-1 sm:p-2">
              <div className="w-1 bg-gray-500 !h-7 sm:h-4"></div>
              <p className="text-sm sm:text-base">Total Payment</p>
              <p className="text-sm sm:text-base">{(projectData.totalAmount).toFixed(2)}</p>
            </div>
            <div className="flex flex-row justify-between items-center border !rounded-lg p-1 sm:p-2">
              <div className="w-1 bg-green-500 !h-7 sm:h-4"></div>
              <p className="text-sm sm:text-base">Payment Received</p>
              <p className="text-sm sm:text-base">{paymentReceived}</p>
            </div>
            <div className="flex flex-row justify-between items-center border !rounded-lg p-1 sm:p-2">
              <div className="w-1 bg-yellow-500 !h-7 sm:h-4"></div>
              <p className="text-sm sm:text-base">Due</p>
              <p className="text-sm sm:text-base">{(projectData.totalAmount - paymentReceived).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section */}
      <div className="flex flex-col lg:flex-row gap-2 sm:gap-4">
        {/* Tailor Info */}
        <div className="flex flex-col w-full lg:w-1/3 border !rounded-lg p-2 sm:p-4">
          <div className="flex flex-row justify-between items-center mb-2 sm:mb-4">
            <p className="text-base sm:text-lg md:text-xl font-medium">Tailor Information</p>
            <button
              onClick={() => setNavState("Tailors")}
              className="text-white bg-sky-600 !rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-base hover:bg-sky-700"
            >
              Assign
            </button>
          </div>
          <div className="flex flex-col gap-1 sm:gap-2 max-h-32 sm:max-h-48 overflow-y-auto">
            {tailorsArray && tailorsArray.map((tailor, index) => (
              <div key={index} className="flex flex-col border !rounded-lg p-1 sm:p-2">
                <p className="text-sm sm:text-base text-sky-600 font-semibold">{tailor.tailorData[0]}</p>
                <p className="text-sm sm:text-base">{tailor.tailorData[1]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interior & Sales */}
        <div className="flex flex-col w-full lg:w-1/3 gap-2 sm:gap-4">
          {[{
            title: "Interior Information",
            data: interiorArray
          }, {
            title: "Sales Associate Information",
            data: salesAssociateArray
          }].map((section, idx) => (
            <div key={idx} className="flex flex-col p-2 sm:p-4 border !rounded-lg">
              <div className="flex flex-row justify-between items-center mb-1 sm:mb-2">
                <p className="text-base sm:text-lg md:text-xl font-medium">{section.title}</p>
                <button
                  onClick={() => setNavState("Customer & Project Details")}
                  className="text-white bg-sky-600 !rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-base hover:bg-sky-700"
                >
                  View
                </button>
              </div>
              <div className="flex flex-col sm:flex-row justify-between">
                <p className="text-sm sm:text-base max-w-[50%] break-words">{section.data[0]}</p>
                <p className="text-sm sm:text-base max-w-[50%] break-words">{section.data[2]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tasks */}
        <div className="flex flex-col p-2 sm:p-4 border !rounded-lg w-full lg:w-1/3">
          <div className="flex flex-row justify-between items-center mb-2 sm:mb-4">
            <p className="text-base sm:text-lg md:text-xl font-medium">Tasks</p>
            <button
              onClick={addNewTask}
              className="text-white bg-sky-600 !rounded-lg px-2 sm:px-3 py-1 text-xs sm:text-base hover:bg-sky-700"
            >
              Create Task
            </button>
          </div>
          <div className="flex flex-col gap-1 sm:gap-2 max-h-32 sm:max-h-48 overflow-y-auto">
            {tasks && tasks.filter(task => task[5] === projectData.projectName).map((task, index) => (
              <div key={index} className="border !rounded-lg p-1 sm:p-2 flex flex-col gap-1 sm:gap-2">
                <div className="flex flex-row justify-between gap-1 sm:gap-2">
                  <p className={`text-xs sm:text-sm text-white !rounded-lg px-1 sm:px-2 py-1 ${
                    task[6] === "High" ? "bg-red-500" :
                    task[6] === "Low" ? "bg-green-500" :
                    task[6] === "Moderate" ? "bg-yellow-500" : ""
                  }`}>{task[6]}</p>
                  <p className={`text-xs sm:text-sm text-white !rounded-lg px-1 sm:px-2 py-1 ${
                    task[7] === "To Do" ? "bg-red-500" :
                    task[7] === "Completed" ? "bg-green-500" :
                    task[7] === "In Progress" ? "bg-yellow-500" : ""
                  }`}>{task[7]}</p>
                </div>
                <p className="text-sm sm:text-base font-semibold">{task[0]}</p>
                <p className="text-xs sm:text-sm">Created At: {task[3]}</p>
                <p className="text-xs sm:text-sm">Description: {task[1]}</p>
                <button
                  onClick={() => { setediting(task); setDialogOpen(true); }}
                  className="border px-2 sm:px-3 py-1 w-full sm:w-24 text-white bg-sky-600 !rounded-lg text-xs sm:text-base hover:bg-sky-700"
                >
                  Edit Task
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Dialog Modal */}
      <AnimatePresence>
        {dialogOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(setTaskDialogOpen(false))}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full max-w-xs sm:max-w-md">
                <TaskDialog
                  onClose={() => setDialogOpen(false)}
                  isEditing={editing}
                  setediting={setediting}
                  name={"NA"}
                  setrefresh={setRefresh}
                  projectData={projects}
                  setTaskDialogOpen={setTaskDialogOpen}
                  taskDialogOpen={dialogOpen}
                  setProjectFlag={setProjectFlag}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OverviewPage;
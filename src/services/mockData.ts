// Helper function to generate dates
const getDate = (daysOffset: number, hoursOffset: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(date.getHours() + hoursOffset);
    return date.toISOString();
};

export const MOCK_APPOINTMENTS = [
    // Today's Pending appointments
    {
        id: 1,
        visitor: {
            vendorName: 'TechCorp',
            contactName: 'John Doe',
        },
        user: {
            employeeName: 'Alice Smith',
        },
        scheduleStartTime: getDate(0, -3), // Today, +2 hours
        scheduleEndTime: getDate(0, -2),
        actualEnterTime: null,
        actualEndTime: null,
        status: {
            name: '未結案',
        },
    },
    {
        id: 2,
        visitor: {
            vendorName: 'Logistics Inc.',
            contactName: 'Jane Roe',
        },
        user: {
            employeeName: 'Bob Jones',
        },
        scheduleStartTime: getDate(0, 4), // Today, +4 hours
        actualEnterTime: null,
        actualEndTime: null,
        status: {
            name: '未結案',
        },
    },

    // Today's Arrived (Ongoing) appointments
    {
        id: 3,
        visitor: {
            vendorName: 'CleanServices',
            contactName: 'Mike Brown',
        },
        user: {
            employeeName: 'Charlie Day',
        },
        scheduleStartTime: getDate(0, -1), // Today, -1 hour
        actualEnterTime: getDate(0, -1),
        actualEndTime: null,
        status: {
            name: '抵達',
        },
    },
    {
        id: 4,
        visitor: {
            vendorName: 'ABC Consulting',
            contactName: 'Sarah Lee',
        },
        user: {
            employeeName: 'David Chen',
        },
        scheduleStartTime: getDate(0, -2), // Today, -2 hours
        actualEnterTime: getDate(0, -2),
        actualEndTime: null,
        status: {
            name: '抵達',
        },
    },
    {
        id: 5,
        visitor: {
            vendorName: 'XYZ Manufacturing',
            contactName: 'Tom Wilson',
        },
        user: {
            employeeName: 'Emily Wang',
        },
        scheduleStartTime: getDate(0, -3), // Today, -3 hours
        actualEnterTime: getDate(0, -3),
        actualEndTime: null,
        status: {
            name: '抵達',
        },
    },

    // Historical records - Yesterday
    {
        id: 6,
        visitor: {
            vendorName: 'Building Maintenance',
            contactName: 'Kevin Park',
        },
        user: {
            employeeName: 'Frank Zhang',
        },
        scheduleStartTime: getDate(-1, -5),
        actualEnterTime: getDate(-1, -5),
        actualEndTime: getDate(-1, -3),
        status: {
            name: '完成',
        },
    },
    {
        id: 7,
        visitor: {
            vendorName: 'IT Support Co.',
            contactName: 'Linda Martinez',
        },
        user: {
            employeeName: 'Grace Liu',
        },
        scheduleStartTime: getDate(-1, -8),
        actualEnterTime: getDate(-1, -8),
        actualEndTime: getDate(-1, -6),
        status: {
            name: '完成',
        },
    },

    // Historical records - 2 days ago
    {
        id: 8,
        visitor: {
            vendorName: 'Legal Services',
            contactName: 'Robert Kim',
        },
        user: {
            employeeName: 'Helen Yu',
        },
        scheduleStartTime: getDate(-2, -4),
        actualEnterTime: getDate(-2, -4),
        actualEndTime: getDate(-2, -2),
        status: {
            name: '完成',
        },
    },
    {
        id: 9,
        visitor: {
            vendorName: 'Catering Services',
            contactName: 'Maria Garcia',
        },
        user: {
            employeeName: 'Ian Patel',
        },
        scheduleStartTime: getDate(-2, -7),
        actualEnterTime: getDate(-2, -7),
        actualEndTime: getDate(-2, -5),
        status: {
            name: '完成',
        },
    },

    // Historical records - 3-5 days ago
    {
        id: 10,
        visitor: {
            vendorName: 'Security Audit',
            contactName: 'James Taylor',
        },
        user: {
            employeeName: 'Jack Morrison',
        },
        scheduleStartTime: getDate(-3, -6),
        actualEnterTime: getDate(-3, -6),
        actualEndTime: getDate(-3, -4),
        status: {
            name: '完成',
        },
    },
    {
        id: 11,
        visitor: {
            vendorName: 'Office Supplies',
            contactName: 'Nancy White',
        },
        user: {
            employeeName: 'Karen Lee',
        },
        scheduleStartTime: getDate(-4, -3),
        actualEnterTime: getDate(-4, -3),
        actualEndTime: getDate(-4, -2),
        status: {
            name: '完成',
        },
    },
    {
        id: 12,
        visitor: {
            vendorName: 'Training Center',
            contactName: 'Oscar Brown',
        },
        user: {
            employeeName: 'Laura Martinez',
        },
        scheduleStartTime: getDate(-5, -5),
        actualEnterTime: getDate(-5, -5),
        actualEndTime: getDate(-5, -1),
        status: {
            name: '完成',
        },
    },

    // Cancelled appointment
    {
        id: 13,
        visitor: {
            vendorName: 'Courier Service',
            contactName: 'Paul Green',
        },
        user: {
            employeeName: 'Mike Johnson',
        },
        scheduleStartTime: getDate(0, 1),
        actualEnterTime: null,
        actualEndTime: null,
        status: {
            name: '取消',
        },
    },
];


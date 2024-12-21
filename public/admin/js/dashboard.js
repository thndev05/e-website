if (document.getElementById("ordersChart")) {

    fetch("/admin/dashboard/analyticsData")
        .then(res => res.json())
        .then(data => {

            const { labels, revenueData, profitData, ordersLabels, ordersData, topProductsLabels, topProductsData } = data;

            // Revenue Chart
            const revenueCtx = document.getElementById('revenueChart').getContext('2d');
            new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Revenue',
                        data: revenueData,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 3,
                        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                        pointRadius: 5,
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: {
                                    size: 14,
                                    weight: 'bold',
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            borderWidth: 1,
                            callbacks: {
                                label: function(tooltipItem) {
                                    return tooltipItem.label + ': $' + tooltipItem.raw.toLocaleString();
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                font: {
                                    size: 12,
                                }
                            },
                            grid: {
                                color: 'rgba(200, 200, 200, 0.5)',
                                lineWidth: 1
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    size: 12,
                                }
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    elements: {
                        line: {
                            tension: 0.4,
                        }
                    }
                }
            });

            // Profit Chart
            const profitCtx = document.getElementById('profitChart').getContext('2d');
            new Chart(profitCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Profit',
                        data: profitData,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 3,
                        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                        pointRadius: 5,
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: {
                                    size: 14,
                                    weight: 'bold',
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            borderWidth: 1,
                            callbacks: {
                                label: function(tooltipItem) {
                                    return tooltipItem.label + ': $' + tooltipItem.raw.toLocaleString();
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                font: {
                                    size: 12,
                                }
                            },
                            grid: {
                                color: 'rgba(200, 200, 200, 0.5)',
                                lineWidth: 1
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    size: 12,
                                }
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    elements: {
                        line: {
                            tension: 0.4,
                        }
                    }
                }
            });

            // Orders Chart
            const ordersCtx = document.getElementById('ordersChart').getContext('2d');
            new Chart(ordersCtx, {
                type: 'line',
                data: {
                    labels: ordersLabels,
                    datasets: [{
                        label: 'Orders',
                        data: ordersData,
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 3,
                        pointBackgroundColor: 'rgba(255, 159, 64, 1)',
                        pointRadius: 5,
                        fill: true,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: {
                                    size: 14,
                                    weight: 'bold',
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            borderWidth: 1,
                            callbacks: {
                                label: function(tooltipItem) {
                                    return tooltipItem.label + ': ' + tooltipItem.raw.toLocaleString() + ' orders';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            ticks: {
                                font: {
                                    size: 12,
                                }
                            },
                            grid: {
                                color: 'rgba(200, 200, 200, 0.5)',
                                lineWidth: 1
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    size: 12,
                                }
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    elements: {
                        line: {
                            tension: 0.4,
                        }
                    }
                }
            });


            // Top Selling Products Chart
            const topProductsCtx = document.getElementById('topProductsChart').getContext('2d');
            new Chart(topProductsCtx, {
                type: 'pie',
                data: {
                    labels: topProductsLabels,
                    datasets: [{
                        label: 'Top Selling Products',
                        data: topProductsData,
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(153, 102, 255, 0.8)',
                        ],
                        borderColor: [
                            'rgba(255, 255, 255, 1)',
                        ],
                        borderWidth: 3,
                        hoverOffset: 10,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: {
                                    size: 14,
                                    weight: 'bold',
                                },
                                color: '#333',
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            borderWidth: 1,
                            callbacks: {
                                label: function(tooltipItem) {
                                    const percentage = ((tooltipItem.raw / topProductsData.reduce((a, b) => a + b, 0)) * 100).toFixed(2);
                                    return `${tooltipItem.label}: ${tooltipItem.raw} sales (${percentage}%)`;
                                }
                            }
                        }
                    },
                    layout: {
                        padding: {
                            top: 20,
                            bottom: 20,
                        }
                    }
                }
            });
        });
}



import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUp, ArrowDown, Package, ShoppingCart, Receipt, Star, Users, GraduationCap, Gift, Trophy, TrendingUp, Crown, Cake, Calendar } from 'lucide-react';
import { generateAdminMetrics, sellers } from '@/lib/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Obtener el mes actual
const currentMonth = new Date().getMonth();

// Filtrar vendedores que cumplen años este mes
const birthdaysThisMonth = sellers
  .filter(seller => seller.birthDate && new Date(seller.birthDate).getMonth() === currentMonth)
  .sort((a, b) => {
    const dayA = new Date(a.birthDate!).getDate();
    const dayB = new Date(b.birthDate!).getDate();
    return dayA - dayB;
  });

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const metrics = generateAdminMetrics();

  if (user?.role === 'seller') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel Principal</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Puntos Acumulados</p>
                <p className="text-2xl font-bold text-primary">{user.points}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">12%</span>
              <span className="text-gray-500">vs mes anterior</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ventas del Mes</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Receipt className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">8%</span>
              <span className="text-gray-500">vs mes anterior</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Compras del Mes</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <ArrowDown className="h-4 w-4 text-red-500" />
              <span className="text-red-500">3%</span>
              <span className="text-gray-500">vs mes anterior</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Capacitaciones</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <ArrowUp className="h-4 w-4 text-green-500" />
              <span className="text-green-500">25%</span>
              <span className="text-gray-500">vs mes anterior</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Semana</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Semana 1', ventas: 8 },
                    { name: 'Semana 2', ventas: 12 },
                    { name: 'Semana 3', ventas: 7 },
                    { name: 'Semana 4', ventas: 15 }
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="ventas" fill="#D61F26" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Puntos Acumulados</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { name: 'Ene', puntos: 450 },
                    { name: 'Feb', puntos: 890 },
                    { name: 'Mar', puntos: 1250 }
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="puntos" stroke="#D61F26" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vendedores Activos</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.summary.activeSellers}</p>
            </div>
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <ArrowUp className="h-4 w-4 text-green-500" />
            <span className="text-green-500">{metrics.summary.salesGrowth}%</span>
            <span className="text-gray-500">vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ventas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.summary.totalSales}</p>
            </div>
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
              <Receipt className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <ArrowUp className="h-4 w-4 text-green-500" />
            <span className="text-green-500">{metrics.summary.salesGrowth}%</span>
            <span className="text-gray-500">vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Premios Entregados</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.summary.totalRewards}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-50 rounded-full flex items-center justify-center">
              <Gift className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <ArrowUp className="h-4 w-4 text-green-500" />
            <span className="text-green-500">{metrics.summary.rewardsGrowth}%</span>
            <span className="text-gray-500">vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Capacitaciones</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.summary.totalTrainings}</p>
            </div>
            <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <ArrowUp className="h-4 w-4 text-green-500" />
            <span className="text-green-500">{metrics.summary.trainingsGrowth}%</span>
            <span className="text-gray-500">vs mes anterior</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Vendedor</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.salesByUser}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#D61F26" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Productos por Tienda</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.productsByStore}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="store" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="products" fill="#D61F26" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Canje de Premios</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.rewardRedemptions}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cantidad" stroke="#D61F26" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Capacitaciones Completadas</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.trainingCompletion}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completados" stroke="#D61F26" />
                <Line type="monotone" dataKey="programados" stroke="#94A3B8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Top Vendedores
          </h2>
          <div className="space-y-4">
            {metrics.topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{performer.name}</p>
                    <p className="text-sm text-gray-500">{performer.quantity} unidades</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary font-medium">
                  <Star className="h-4 w-4" />
                  {performer.points} pts
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Cake className="h-5 w-5 text-primary" />
            Cumpleaños del Mes
          </h2>
          {birthdaysThisMonth.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {birthdaysThisMonth.map((seller) => {
                const birthDate = new Date(seller.birthDate!);
                const day = birthDate.getDate();
                const monthName = format(birthDate, 'MMMM', { locale: es });
                
                return (
                  <div key={seller.id} className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
                    <div className="relative">
                      <img
                        src={seller.avatar}
                        alt={seller.name}
                        className="h-12 w-12 rounded-full"
                      />
                      <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {day}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{seller.name}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{day} de {monthName}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Cake className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No hay cumpleaños este mes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
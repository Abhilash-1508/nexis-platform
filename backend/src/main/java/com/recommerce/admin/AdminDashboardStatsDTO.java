package com.recommerce.admin;

public class AdminDashboardStatsDTO {
    private long totalUsers;
    private long totalProducts;
    private double totalRevenue;
    private long activeListings;
    private long suspendedUsers;

    public AdminDashboardStatsDTO() {}

    public AdminDashboardStatsDTO(long totalUsers, long totalProducts, double totalRevenue, long activeListings, long suspendedUsers) {
        this.totalUsers = totalUsers;
        this.totalProducts = totalProducts;
        this.totalRevenue = totalRevenue;
        this.activeListings = activeListings;
        this.suspendedUsers = suspendedUsers;
    }

    // Getters and Setters
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalProducts() { return totalProducts; }
    public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getActiveListings() { return activeListings; }
    public void setActiveListings(long activeListings) { this.activeListings = activeListings; }

    public long getSuspendedUsers() { return suspendedUsers; }
    public void setSuspendedUsers(long suspendedUsers) { this.suspendedUsers = suspendedUsers; }
}

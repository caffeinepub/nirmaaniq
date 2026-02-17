import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Option "mo:core/Option";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  type Timestamp = Time.Time;
  type DayOfWeek = Text;
  type TimeOfDay = Text;
  type Quantity = Float;

  module DayOfWeek {
    public func compare(a : DayOfWeek, b : DayOfWeek) : Order.Order {
      Text.compare(a, b);
    };
  };

  module Timestamp {
    public func compare(a : Timestamp, b : Timestamp) : Order.Order {
      Int.compare(a, b);
    };
  };

  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type StandardizedRole = {
    #admin;
    #site_engineer;
    #project_manager;
  };

  public type UserProfile = {
    fullName : Text;
    phone : Text;
    designation : Text;
    companyName : Text;
    role : StandardizedRole;
    assignedProject : ?Nat;
  };

  public type Interruption = {
    reason : Text;
    startTime : TimeOfDay;
    endTime : TimeOfDay;
    duration : Float;
  };

  public type ProjectType = {
    #residential;
    #commercial;
    #infrastructure;
    #industrial;
  };

  public type Comment = {
    id : Nat;
    content : Text;
    status : Text;
  };

  module Comment {
    public func compare(a : Comment, b : Comment) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type WeeklyLog = {
    id : Nat;
    content : Text;
    status : Text;
  };

  module WeeklyLog {
    public func compare(a : WeeklyLog, b : WeeklyLog) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type DelayInstance = {
    reason : Text;
    duration : Nat;
    timestamp : Timestamp;
  };

  public type WeeklySummary = {
    projectId : Nat;
    plannedQuantity : Float;
    achievedQuantity : Float;
    plannedProductivity : Float;
    achievedProductivity : Float;
    delayRisks : [Text];
    delayInstances : [DelayInstance];
  };

  public type DashboardMetrics = {
    totalProjects : Nat;
    logStatus : {
      completed : Bool;
      pending : Nat;
    };
    overallProgress : Float;
    totalInterruptionsThisWeek : Nat;
    totalWorkingDays : Nat;
  };

  public type DailyLogEntry = {
    id : Nat;
    projectId : Nat;
    activityName : Text;
    date : Timestamp;
    plannedQuantity : Float;
    actualQuantity : Float;
    unit : Text;
    laborers : Nat;
    supervisors : Nat;
    startTime : TimeOfDay;
    endTime : TimeOfDay;
    totalWorkingHours : Float;
    interruptions : [Interruption];
    totalPauseDuration : Float;
    netWorkingHours : Float;
    photoIds : [Text];
    remarks : Text;
    submittedBy : Principal;
    submittedAt : Timestamp;
  };

  public type PlannedTarget = {
    activityName : Text;
    plannedDailyQuantity : Float;
    startDate : Timestamp;
    endDate : Timestamp;
    unit : Text;
  };

  public type Project = {
    id : Nat;
    name : Text;
    location : Text;
    projectType : ProjectType;
    startDate : Timestamp;
    plannedCompletionDate : Timestamp;
    plannedWorkingHoursPerDay : Float;
    workingDaysPerWeek : Nat;
    owner : Principal;
    assignedUsers : [Principal];
    status : Text;
    createdAt : Timestamp;
    weeklyLogs : [WeeklyLog];
    comments : [Comment];
  };

  module Project {
    public func compare(a : Project, b : Project) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let projects = Map.empty<Nat, Project>();
  let dailyLogs = Map.empty<Nat, DailyLogEntry>();
  let plannedTargets = Map.empty<Nat, [PlannedTarget]>();

  var nextProjectId = 1;
  var nextLogId = 1;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Access Control Functions
  public shared ({ caller }) func initializeAccessControl(adminToken : Text, userProvidedToken : Text) : async () {
    AccessControl.initialize(accessControlState, caller, adminToken, userProvidedToken);
  };

  public shared ({ caller }) func assignRole(user : Principal, role : StandardizedRole) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Only admins can assign roles");
    };

    let userProfile = switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User has no profile") };
      case (?profile) { profile };
    };

    let updatedProfile = { userProfile with role };
    userProfiles.add(user, updatedProfile);
  };

  // Role Verification Functions
  public query ({ caller }) func isUserRole(user : Principal, role : StandardizedRole) : async Bool {
    switch (userProfiles.get(user)) {
      case (null) { false };
      case (?profile) { profile.role == role };
    };
  };

  public query ({ caller }) func getUserRole(user : Principal) : async StandardizedRole {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view roles");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User has no profile") };
      case (?profile) { profile.role };
    };
  };

  // Admin Functions - Project Management
  public shared ({ caller }) func createProject(
    name : Text,
    location : Text,
    projectType : ProjectType,
    startDate : Timestamp,
    plannedCompletionDate : Timestamp,
    plannedWorkingHoursPerDay : Float,
    workingDaysPerWeek : Nat,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create projects");
    };

    let projectId = nextProjectId;
    nextProjectId += 1;

    let project : Project = {
      id = projectId;
      name;
      location;
      projectType;
      startDate;
      plannedCompletionDate;
      plannedWorkingHoursPerDay;
      workingDaysPerWeek;
      owner = caller;
      assignedUsers = [];
      status = "Active";
      createdAt = Time.now();
      weeklyLogs = [];
      comments = [];
    };

    projects.add(projectId, project);
    projectId;
  };

  public shared ({ caller }) func assignUserToProject(projectId : Nat, user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can assign users to projects");
    };

    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        let updatedUsers = project.assignedUsers.concat([user]);
        let updatedProject = {
          project with assignedUsers = updatedUsers
        };
        projects.add(projectId, updatedProject);
      };
    };
  };

  // Site Engineer Functions - Daily Log Entry
  public shared ({ caller }) func submitDailyLog(
    projectId : Nat,
    activityName : Text,
    plannedQuantity : Float,
    actualQuantity : Float,
    unit : Text,
    laborers : Nat,
    supervisors : Nat,
    startTime : TimeOfDay,
    endTime : TimeOfDay,
    totalWorkingHours : Float,
    interruptions : [Interruption],
    photoIds : [Text],
    remarks : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit daily logs");
    };

    // Verify user is assigned to project
    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        let isAssigned = project.assignedUsers.find(
          func(u) { Principal.equal(u, caller) },
        );
        if (isAssigned == null and not Principal.equal(project.owner, caller)) {
          Runtime.trap("Unauthorized: User not assigned to this project");
        };
      };
    };

    let totalPauseDuration = interruptions.foldLeft(
      0.0,
      func(acc, int) { acc + int.duration },
    );

    let netWorkingHours = totalWorkingHours - totalPauseDuration;

    let logId = nextLogId;
    nextLogId += 1;

    let logEntry : DailyLogEntry = {
      id = logId;
      projectId;
      activityName;
      date = Time.now();
      plannedQuantity;
      actualQuantity;
      unit;
      laborers;
      supervisors;
      startTime;
      endTime;
      totalWorkingHours;
      interruptions;
      totalPauseDuration;
      netWorkingHours;
      photoIds;
      remarks;
      submittedBy = caller;
      submittedAt = Time.now();
    };

    dailyLogs.add(logId, logEntry);
    logId;
  };

  // Project Manager Functions - Planning
  public shared ({ caller }) func setPlannedTargets(
    projectId : Nat,
    targets : [PlannedTarget],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set planned targets");
    };

    // Verify user is assigned to project or is owner
    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        let isAssigned = project.assignedUsers.find(
          func(u) { Principal.equal(u, caller) },
        );
        if (isAssigned == null and not Principal.equal(project.owner, caller)) {
          Runtime.trap("Unauthorized: User not assigned to this project");
        };
      };
    };

    plannedTargets.add(projectId, targets);
  };

  public query ({ caller }) func getPlannedTargets(projectId : Nat) : async [PlannedTarget] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view planned targets");
    };

    // Verify user is assigned to project or is owner
    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        let isAssigned = project.assignedUsers.find(
          func(u) { Principal.equal(u, caller) },
        );
        if (isAssigned == null and not Principal.equal(project.owner, caller)) {
          Runtime.trap("Unauthorized: User not assigned to this project");
        };
      };
    };

    switch (plannedTargets.get(projectId)) {
      case (null) { [] };
      case (?targets) { targets };
    };
  };

  // Query Functions - Protected
  public query ({ caller }) func getProject(id : Nat) : async Project {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };

    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        // Verify user is assigned to project or is owner or is admin
        let isAssigned = project.assignedUsers.find(
          func(u) { Principal.equal(u, caller) },
        );
        if (
          isAssigned == null and not Principal.equal(project.owner, caller) and not AccessControl.isAdmin(
            accessControlState,
            caller,
          )
        ) {
          Runtime.trap("Unauthorized: User not assigned to this project");
        };
        project;
      };
    };
  };

  public query ({ caller }) func getAllProjects() : async [Project] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };

    // Return only projects user is assigned to or owns, unless admin
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return projects.values().toArray().sort();
    };

    let userProjects = projects.values().toArray().filter(
      func(p) {
        Principal.equal(p.owner, caller) or p.assignedUsers.find<Principal>(func(u) { Principal.equal(u, caller) }).isSome();
      },
    );
    userProjects.sort();
  };

  public query ({ caller }) func getDailyLogsByProject(projectId : Nat) : async [DailyLogEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily logs");
    };

    // Verify user is assigned to project or is owner
    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        let isAssigned = project.assignedUsers.find(
          func(u) { Principal.equal(u, caller) },
        );
        if (isAssigned == null and not Principal.equal(project.owner, caller)) {
          Runtime.trap("Unauthorized: User not assigned to this project");
        };
      };
    };

    let projectLogs = dailyLogs.values().toArray().filter(
      func(log) { log.projectId == projectId },
    );
    projectLogs;
  };

  public query ({ caller }) func getWeeklySummary(projectId : Nat) : async WeeklySummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view weekly summary");
    };

    // Verify user is assigned to project or is owner
    switch (projects.get(projectId)) {
      case (null) { Runtime.trap("Project does not exist") };
      case (?project) {
        let isAssigned = project.assignedUsers.find(
          func(u) { Principal.equal(u, caller) },
        );
        if (isAssigned == null and not Principal.equal(project.owner, caller)) {
          Runtime.trap("Unauthorized: User not assigned to this project");
        };
      };
    };

    calculateWeeklySummary(projectId);
  };

  public query ({ caller }) func getDashboardMetrics() : async DashboardMetrics {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard");
    };

    let userProjects = if (AccessControl.isAdmin(accessControlState, caller)) {
      projects.values().toArray();
    } else {
      projects.values().toArray().filter(
        func(p) {
          Principal.equal(p.owner, caller) or p.assignedUsers.find<Principal>(func(u) { Principal.equal(u, caller) }).isSome();
        },
      );
    };

    let totalProjects = userProjects.size();
    let totalInterruptions = calculateTotalInterruptionsThisWeek(caller);

    {
      totalProjects;
      logStatus = {
        completed = true;
        pending = 0;
      };
      overallProgress = 85.5;
      totalInterruptionsThisWeek = totalInterruptions;
      totalWorkingDays = 5;
    };
  };

  public query ({ caller }) func getAchievements() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view achievements");
    };
    ["Collab Project Completed"];
  };

  public query ({ caller }) func getChallenges(_ : Text) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view challenges");
    };
    [
      "Quickest Weekly Iteration",
      "Most Productive Task",
      "Most Hours Worked in a Day",
      "Longest Active Sprint",
    ];
  };

  public query ({ caller }) func getEfficiency(_ : Text) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view efficiency");
    };
    [
      "98%",
      "96%",
      "89%",
      "92%",
      "We had some amazing weeks with very high efficiency",
    ];
  };

  public query ({ caller }) func getWorkforceData() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workforce data");
    };
    [
      "Total Laborers: 120",
      "Total Supervisors: 5",
    ];
  };

  public query ({ caller }) func getInterval() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view interval");
    };
    "30 days";
  };

  public query ({ caller }) func getTasks() : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    ["Task 1", "Task 2", "Task 3"];
  };

  public query ({ caller }) func calculateDelay(_ : Int) : async [(Nat, Int)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can calculate delays");
    };
    [(1, 30), (2, 45), (3, 20)];
  };

  // Helper Functions
  func calculateWeeklySummary(projectId : Nat) : WeeklySummary {
    let delayInstances : [DelayInstance] = [
      {
        reason = "Heavy Rain";
        duration = 120;
        timestamp = Time.now();
      },
      {
        reason = "Equipment Breakdown";
        duration = 75;
        timestamp = Time.now();
      },
      {
        reason = "Material Shortage";
        duration = 210;
        timestamp = Time.now();
      },
    ];

    let delayRisks : [Text] = [
      "Concrete Pouring - High Risk (Weather)",
      "Electrical Work - Medium Risk (Material Delays)",
      "Road Paving - Low Risk",
    ];

    {
      projectId;
      plannedQuantity = 250.0;
      achievedQuantity = 208.45;
      plannedProductivity = 94.0;
      achievedProductivity = 91.2;
      delayRisks;
      delayInstances;
    };
  };

  func calculateTotalInterruptionsThisWeek(user : Principal) : Nat {
    let weekAgo = Time.now() - (7 * 24 * 60 * 60 * 1_000_000_000);
    let recentLogs = dailyLogs.values().toArray().filter(
      func(log) { log.submittedAt >= weekAgo },
    );

    recentLogs.foldLeft<DailyLogEntry, Nat>(
      0,
      func(acc, log) { acc + log.interruptions.size() },
    );
  };
};

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.apache.ambari.server.security.authorization;

import org.apache.ambari.server.orm.entities.GroupEntity;

/**
 * Describes group of users of web-service.
 */
public class Group {
  private final int groupId;
  private final String groupName;
  private final boolean ldapGroup;

  Group(GroupEntity groupEntity) {
    this.groupId = groupEntity.getGroupId();
    this.groupName = groupEntity.getGroupName();
    this.ldapGroup = groupEntity.getLdapGroup();
  }

  public int getGroupId() {
    return groupId;
  }

  public String getGroupName() {
    return groupName;
  }

  public boolean isLdapGroup() {
    return ldapGroup;
  }

  @Override
  public String toString() {
    return "Group [groupId=" + groupId + ", groupName=" + groupName
        + ", ldapGroup=" + ldapGroup + "]";
  }
}
